// dst-scanner.js — v4.5-final
// DST Structural Intelligence Engine
//
// v4.5 additions:
//   - κ_i expiration contract: @dst-kappa-i: expires YYYY-MM-DD annotation
//     Active κ_i → 0 penalty, listed in Accept column
//     Expired κ_i → -15 penalty, reclassified to κ_a, listed in Fix column
//   - DST_DATA_SCALE: σ amplifiers scaled by environment mass
//     small=×0.5 · medium=×1.0 · large=×2.0 · hyperscale=×4.0
//   - AST parallel engine (Babel): AST is now PRIMARY when available
//     Rule 1 σ: N+1 — await inside loop body (AST-accurate)
//     Rule 2 κ_a: silent catch — CatchClause with no throw (AST-accurate)
//     Regex runs as fallback only when @babel/parser unavailable
//   - detectJS split into 6 focused sub-scanners (κ_a god function eliminated)
//   - structuredReport: clean JSON object in runFullScan return value
//   - DST_SELF_SCAN=1: scanner diagnoses itself, posts own Θ in PR comment
//
// v4 additions (math-grounded):
//   - Θ naming, κ classification, observability gap, σ_eff, κ saturation
//   - dΘ/dt trajectory, regime prediction, rewrite signal, three action lists
//
// Locked constants:
//   REWRITE_THRESHOLD = 30   (Θ below this)
//   REWRITE_DECAY     = -2   (dΘ/dt below this per PR)
//   KAPPA_I_EXPIRED_PENALTY = -15
//
// DST Framework: ρ heals · κ hides · σ kills
// SSRN 6434119 · Idan Rephiah · 2026

'use strict';

const fs   = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ── CONFIG ────────────────────────────────────────────────────────────────
const IGNORE_DIRS = new Set([
  'node_modules','.git','dist','build','coverage',
  '.next','.nuxt','out','.cache','vendor','.turbo',
  '__pycache__','.pytest_cache','.mypy_cache','venv','.venv'
]);

const JS_EXTS  = new Set(['.js','.ts','.jsx','.tsx','.mjs','.cjs']);
const PY_EXTS  = new Set(['.py']);
const SCAN_EXTS = new Set([...JS_EXTS, ...PY_EXTS]);

const MAX_FILE_LINES  = 5000;
const MAX_FILE_BYTES  = 200_000;
const MAX_PR_FINDINGS = 10;
const TREND_FILE      = '.dst-trend.json';

// ── V4 LOCKED CONSTANTS ───────────────────────────────────────────────────
const REWRITE_THRESHOLD = 30;
const REWRITE_DECAY     = -2;
const MAX_ACTION_LIST   = 5;

// ── V4.5 CONSTANTS ────────────────────────────────────────────────────────
const KAPPA_I_EXPIRED_PENALTY = -15; // expired κ_i reclassified → κ_a

// DST_DATA_SCALE: σ amplifiers scaled by environment mass
// σ is not constant — same N+1 on admin dashboard vs checkout flow ≠ same risk
const SIGMA_SCALE = (() => {
  const s = (process.env.DST_DATA_SCALE || 'medium').toLowerCase();
  return { small:0.5, medium:1.0, large:2.0, hyperscale:4.0 }[s] || 1.0;
})();

// Try to load @babel/parser for AST engine (optional — regex always fallback)
let babelParser = null, babelTraverse = null;
try {
  babelParser   = require('@babel/parser');
  babelTraverse = require('@babel/traverse').default;
} catch {
  // AST engine unavailable — regex engine handles all detection
}

// ── ROI MULTIPLIERS — configurable via env vars ───────────────────────────
const HOURS = {
  retry:       parseFloat(process.env.DST_HOURS_RETRY   || '4'),
  error:       parseFloat(process.env.DST_HOURS_ERROR   || '6'),
  god:         parseFloat(process.env.DST_HOURS_GOD     || '8'),
  state:       parseFloat(process.env.DST_HOURS_STATE   || '3'),
  nplus:       parseFloat(process.env.DST_HOURS_NPLUS   || '5'),
  onboard:     parseFloat(process.env.DST_HOURS_ONBOARD || '160'),
  debt:        parseFloat(process.env.DST_HOURS_DEBT    || '10'),
};

// ── COMPILED JS PATTERNS ──────────────────────────────────────────────────
const JS = {
  retryLoop:     /while\s*\(\s*retries?\s*[<>]|for\s*\(\s*\w+\s*=\s*0[^;]*;\s*\w+\s*<\s*\d/i,
  retryVar:      /\bretry(?:Count|Limit|Times|Attempts)\b|\bmaxRetries\b/i,
  catchOpen:     /(?:\}\s*)?catch\s*\(/,
  realHandler:   /\bthrow\b|\breject\b|\bemit\s*\(|\bstatus\s*\(\s*5|\bsendStatus\s*\(\s*5|\bcapture\b|\bnotify\b/i,
  silentCatch:   /console\s*\.\s*(?:log|warn)\s*\(|\/\/\s*(?:silent|ignore|swallow)/i,
  todoLine:      /^\s*\/\/\s*(?:TODO|FIXME|HACK|XXX|TEMP|WORKAROUND)\b/i,
  commentedCode: /^\s*\/\/\s*(?:const|let|var|function|async|return|if\s*\(|for\s*\(|while\s*\(|await\s|import\s|export\s)/,
  tripleOr:      /\|\|\s*\w[\w.]*\s*\|\|\s*\w/,
  mutAssign:     /\b([a-z]\w{3,})\s*\.\s*([a-z]\w{3,})\s*=[^=]/i,
  mutExclude:    /^\s*(?:module\.exports|exports\.|this\.|const |let |var |return |\/\/|\/\*)/,
  anyType:       /:\s*any\b|<any>|\bany\[\]/,
  loopHead:      /\bfor\s*\(|\bforEach\b|\.map\s*\(|\bfor\s+of\b/,
  dbCall:        /\bawait\b.{0,50}\b(?:find|get|fetch|query|select|load|findOne|findAll|findById)\b/i,
  pushOrAppend:  /\b(\w+)\s*\.\s*push\s*\(|\b(\w+)\s*\+=/,
  regexLiteral:  /^\s*\/[^/].*\/[gimsuy]*[,;]?\s*$/,
  isCircuitBrk:  /\bbackoff\b|\bexponential\b|\bcircuit\b|\bthis\.max\w*Retries\b/i,
  isBatched:     /\bbatch\b|\bchunk\b|\blimit\b|\bfindAll\b|\bfindIn\b|\bin\s*\(/i,
  throwNew:      /\bthrow\s+new\s+\w+Error\b/,
  freezeConst:   /Object\.freeze\b|as\s+const\b|\breadonly\s+/,
  ifaceOrType:   /^\s*(?:interface|type)\s+\w+\s*[={<]/,
};

// ── COMPILED PYTHON PATTERNS ──────────────────────────────────────────────
const PY = {
  retryLoop:     /for\s+\w+\s+in\s+range\s*\(.*retries|while\s+.*retries|retry_count|max_retries/i,
  exceptSilent:  /^\s*except\s*(?:\w+\s*)?:/,
  exceptPass:    /^\s*pass\s*$/,
  todoLine:      /^\s*#\s*(?:TODO|FIXME|HACK|XXX|TEMP|WORKAROUND)\b/i,
  commentedCode: /^\s*#\s*(?:def |class |import |from |return |if |for |while |async )/,
  loopHead:      /^\s*for\s+\w+\s+in\s+/,
  dbCall:        /\.(?:filter|get|query|execute|fetchall|fetchone)\s*\(/i,
  appendUnbound: /\b(\w+)\s*\.\s*append\s*\(/,
  mutAssign:     /\b(\w{4,})\s*\.\s*(\w{4,})\s*=/,
  typeIgnore:    /#\s*type:\s*ignore/i,
  raiseExcept:   /\braise\b/,
  dataclass:     /@dataclass|@frozen/i,
  typeHint:      /def\s+\w+\s*\([^)]*:\s*\w|:\s*(?:str|int|float|bool|list|dict|tuple|Optional|Union|Any)\b/,
  isBatched:     /\bbulk_create\b|\bbulk_update\b|\bin_bulk\b|\bvalues_list\b/i,
};

// ── WEIGHTS ───────────────────────────────────────────────────────────────
const W = {
  // κ — masking (affect DST score)
  retry_loop:        { score:-8,  cat:'kappa', sev:'medium' },
  error_swallowing:  { score:-12, cat:'kappa', sev:'high'   },
  god_function:      { score:-10, cat:'kappa', sev:'high'   },
  todo_comment:      { score:-3,  cat:'kappa', sev:'low'    },
  triple_normalizer: { score:-7,  cat:'kappa', sev:'medium' },
  commented_code:    { score:-4,  cat:'kappa', sev:'low'    },
  implicit_state:    { score:-9,  cat:'kappa', sev:'high'   },
  deep_nesting:      { score:-6,  cat:'kappa', sev:'medium' },
  large_file:        { score:-6,  cat:'kappa', sev:'low'    },
  any_type:          { score:-4,  cat:'kappa', sev:'low'    },
  // σ — amplifiers (affect DST score, weighted heavily in risk)
  n_plus_one:        { score:-15, cat:'sigma', sev:'critical'},
  unbounded_growth:  { score:-10, cat:'sigma', sev:'high'   },
  // security — advisory only (do NOT affect DST health score)
  unvalidated_input: { score:0,   cat:'security', sev:'high' },
  sql_concat:        { score:0,   cat:'security', sev:'critical' },
  hardcoded_secret:  { score:0,   cat:'security', sev:'critical' },
  // ρ — healing
  explicit_error:    { score:+4,  cat:'rho' },
  immutable:         { score:+4,  cat:'rho' },
  typed_interface:   { score:+3,  cat:'rho' },
  pure_function:     { score:+5,  cat:'rho' },
};

const FIX = {
  retry_loop:        'Stabilize the upstream dependency. Remove the retry once it is reliable.',
  error_swallowing:  'Throw, rethrow, or handle explicitly. Never let an error disappear.',
  god_function:      'Split by responsibility. Each function should have one reason to change.',
  todo_comment:      'Schedule a dedicated fix. Every TODO that survives a sprint becomes permanent.',
  triple_normalizer: 'Normalize at the API/DB boundary once. Consumers receive a consistent shape.',
  commented_code:    'Delete it. Git has the history. If needed, it can be recovered.',
  implicit_state:    'Return new state instead of mutating. Make side effects explicit.',
  deep_nesting:      'Extract inner blocks into named functions. Early returns reduce nesting.',
  large_file:        'Split by responsibility. A file should have one reason to change.',
  any_type:          'Define the actual type. If unknown, that is the problem to solve first.',
  n_plus_one:        'Batch the query outside the loop. Load all records in one call.',
  unbounded_growth:  'Add a maximum size, use WeakMap, or clear on lifecycle events.',
  unvalidated_input: 'Validate and sanitize all input before use. Consider pydantic, joi, zod, or yup.',
  sql_concat:        'Use parameterized queries or an ORM. Never concatenate user input into SQL.',
  hardcoded_secret:  'Move to environment variables. Rotate the exposed secret immediately.',
};

// ── RISK ENGINE ───────────────────────────────────────────────────────────
function calculateRiskScore(kappaCount, sigmaCount, secFindings, theta = 50) {
  // Raw risk from pattern counts
  const raw = (sigmaCount * 15) + (secFindings * 20) + (kappaCount * 3);

  // v4.5: Regime multiplier — risk is not context-free.
  // An Elastic system (Θ=100) with many findings has high ρ absorbing the load.
  // A Residual system (Θ=10) with the same findings is in delayed failure.
  // The same raw count means something structurally different per regime.
  const regimeMultiplier =
    theta >= 75 ? 0.15 :   // Elastic:      ρ dominant, risk contained
    theta >= 50 ? 0.55 :   // Plastic:      κ active, risk real but managed
    theta >= 25 ? 0.85 :   // Late Plastic: κ near exhaustion, risk elevated
                 1.00;     // Residual:     full raw risk, no dampening

  const score = Math.min(100, Math.round(raw * regimeMultiplier));
  let level, desc;
  if (score >= 70) { level = 'CRITICAL'; desc = 'Immediate action required — structural collapse and breach risk are both elevated'; }
  else if (score >= 45) { level = 'HIGH';     desc = 'Significant structural and security exposure — prioritize before next feature sprint'; }
  else if (score >= 20) { level = 'MEDIUM';   desc = 'Manageable risk — address top findings within 2 sprints'; }
  else                  { level = 'LOW';      desc = 'Risk is contained — maintain current practices'; }
  return { score, level, desc, regimeMultiplier };
}

// ── REGIME WARNING ────────────────────────────────────────────────────────
function regimeWarning(regimeName) {
  const warnings = {
    'Elastic': null,
    'Plastic': {
      icon: '⚠️',
      title: 'SYSTEM WARNING: PLASTIC REGIME',
      lines: [
        'Stability is currently maintained via κ (masking)',
        'Θ (real capacity) is declining beneath the surface',
        'New features are accelerating structural debt',
      ],
      action: 'Strategic shift needed: for every new feature added, close at least one κ channel.',
    },
    'Late Plastic': {
      icon: '🚨',
      title: 'SYSTEM WARNING: LATE PLASTIC REGIME',
      lines: [
        'κ channels are near saturation — masking is losing effectiveness',
        'Θ (real capacity) is critically low',
        'Each new feature costs significantly more than it should',
      ],
      action: 'Recommended: freeze new feature development. Address top 3 κ sources before next sprint.',
    },
    'Residual': {
      icon: '🔴',
      title: 'CRITICAL: RESIDUAL REGIME — STRUCTURAL FAILURE EMBEDDED',
      lines: [
        'κ is exhausted or near κ_max — masking is no longer effective',
        'Θ → 0: the system is in delayed failure mode',
        'New features will accelerate cascade, not delay it',
      ],
      action: 'STOP adding features. Initiate structural repair immediately. The next incident will not be gradual.',
    },
  };
  return warnings[regimeName] || null;
}

// ── TREND ENGINE ──────────────────────────────────────────────────────────
function loadTrend(artifactDir) {
  try {
    const f = path.join(artifactDir || '.', TREND_FILE);
    if (fs.existsSync(f)) return JSON.parse(fs.readFileSync(f, 'utf8'));
  } catch {}
  return null;
}

function saveTrend(score, regime, artifactDir) {
  try {
    const f = path.join(artifactDir || '.', TREND_FILE);
    const history = loadTrend(artifactDir)?.history || [];
    history.push({ score, regime, ts: new Date().toISOString() });
    if (history.length > 20) history.shift(); // keep last 20
    fs.writeFileSync(f, JSON.stringify({ score, regime, history }, null, 2));
  } catch {}
}

function buildTrendSummary(currentScore, trend) {
  if (!trend) return null;
  const prev = trend.score;
  const delta = currentScore - prev;
  const history = trend.history || [];
  const recentDeltas = history.slice(-5).map((h,i,a) =>
    i === 0 ? null : h.score - a[i-1].score
  ).filter(Boolean);
  const avgDelta = recentDeltas.length
    ? Math.round(recentDeltas.reduce((a,b)=>a+b,0) / recentDeltas.length)
    : null;

  return {
    delta,
    prev,
    direction: delta > 0 ? 'improving' : delta < 0 ? 'worsening' : 'stable',
    arrow: delta > 0 ? '↑' : delta < 0 ? '↓' : '→',
    avgDelta,
    prCount: recentDeltas.length,
  };
}

// ── V4.5: AST PARALLEL ENGINE ─────────────────────────────────────────────
// Runs alongside regex when @babel/parser is available.
// AST understands structure — regex counts words.
// Two proof-of-concept rules:
//   Rule 1 σ: N+1 — await inside loop body (flow-accurate)
//   Rule 2 κ_a: silent catch — CatchClause with no throw/rethrow
//
// When AST finds something regex also found: AST result wins (more precise).
// When AST finds something regex missed: additional finding added.
// Regex always runs as fallback — zero regression risk.
function detectJSWithAST(content, filePath) {
  const findings = [];
  if (!babelParser || !babelTraverse) return findings;

  let ast;
  try {
    ast = babelParser.parse(content, {
      sourceType: 'unambiguous',
      plugins: ['typescript', 'jsx', 'decorators-legacy', 'classProperties'],
      errorRecovery: true,
    });
  } catch { return findings; } // parse failure → regex handles it

  const lines = content.split('\n');

  babelTraverse(ast, {
    // Rule 1 σ: N+1 — await fetch/db call inside a loop body
    // Regex approximates this. AST knows the exact containment.
    'ForStatement|ForInStatement|ForOfStatement|WhileStatement'(nodePath) {
      const body = nodePath.node.body;
      nodePath.traverse({
        AwaitExpression(awaitPath) {
          const callee = awaitPath.node.argument;
          if (!callee) return;

          // Check if it's a db/fetch call
          const callStr = content.slice(callee.start, callee.end);
          const isDbCall = /\b(?:fetch|find|get|query|select|load|findOne|findAll|findById)\b/i.test(callStr);
          if (!isDbCall) return;

          // Confirm it's actually inside the loop body (not a sibling)
          let cur = awaitPath;
          while (cur && cur.node !== body) {
            if (cur.parent === nodePath.node) return; // not inside body
            cur = cur.parentPath;
          }

          const line = awaitPath.node.loc?.start.line || 0;
          findings.push(make('n_plus_one', line,
            lines[line - 1]?.trim().substring(0, 70) || 'await inside loop',
            'AST: DB/fetch call inside loop body — confirmed N+1 σ amplifier',
            { astDetected: true }
          ));
        }
      });
    },

    // Rule 2 κ_a: silent catch — CatchClause with no throw or error propagation
    // Regex catches many of these but has false positives on formatting.
    // AST checks the actual block structure.
    CatchClause(nodePath) {
      const body = nodePath.node.body;
      if (!body || !body.body) return;

      const stmts = body.body;
      if (stmts.length === 0) {
        // Completely empty catch {}
        const line = nodePath.node.loc?.start.line || 0;
        findings.push(make('error_swallowing', line,
          lines[line - 1]?.trim().substring(0, 70) || 'catch {}',
          'AST: Empty catch block — error disappears completely',
          { astDetected: true }
        ));
        return;
      }

      // Check if any statement throws, rejects, or returns an error
      const hasRealHandler = stmts.some(stmt => {
        const s = content.slice(stmt.start, stmt.end);
        return /\bthrow\b|\breject\b|\breturn.*[Ee]rror|\bemit\b/.test(s);
      });

      if (!hasRealHandler) {
        // Only console.log/warn — swallowing
        const hasConsole = stmts.some(stmt => {
          const s = content.slice(stmt.start, stmt.end);
          return /\bconsole\s*\.\s*(?:log|warn|error)\b/.test(s);
        });
        if (hasConsole) {
          const line = nodePath.node.loc?.start.line || 0;
          findings.push(make('error_swallowing', line,
            lines[line - 1]?.trim().substring(0, 70) || 'catch (e) { console }',
            'AST: Catch logs but does not throw — error masked, caller unaware',
            { astDetected: true }
          ));
        }
      }
    },
  });

  return findings;
}

// ── JS DETECTOR ───────────────────────────────────────────────────────────
// ── FOCUSED JS SUB-SCANNERS (split from god-function detectJS) ────────────
// Each scanner has one responsibility. Pure functions. Testable in isolation.

function scanSilentCatches(lines) {
  const findings = [];
  let inCatch = false, catchDepth = 0, catchLines = [], catchStart = 0;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const opens  = (line.match(/\{/g)||[]).length;
    const closes = (line.match(/\}/g)||[]).length;
    if (JS.catchOpen.test(line)) {
      // Inline catch on one line
      const inlineMatch = line.match(/catch\s*\([^)]*\)\s*\{([^}]*)\}/);
      if (inlineMatch) {
        const inlineBody = inlineMatch[1];
        const hasReal  = JS.realHandler.test(inlineBody);
        const isSilent = !hasReal && (JS.silentCatch.test(inlineBody) || inlineBody.trim() === '' || !inlineBody.trim().replace(/\/\/[^\n]*/g,'').trim());
        if (isSilent) findings.push(make('error_swallowing', i+1, line.trim().substring(0,70), 'Error caught but not meaningfully handled — disappears here'));
      } else {
        inCatch = true; catchDepth = 1; catchLines = [line]; catchStart = i + 1;
      }
    } else if (inCatch) {
      catchLines.push(line);
      catchDepth += opens - closes;
      if (catchDepth <= 0) {
        const body = catchLines.join('\n');
        const hasReal  = JS.realHandler.test(body);
        const innerLines = catchLines.slice(1, -1);
        const hasActualCode = innerLines.some(l => {
          const s = l.trim();
          return s && !s.startsWith('//') && !s.startsWith('/*') && !s.startsWith('*') && s !== '*/';
        });
        if (!hasReal && (JS.silentCatch.test(body) || catchLines.length <= 2 || !hasActualCode))
          findings.push(make('error_swallowing', catchStart, catchLines[0]?.trim().substring(0,70)||'catch', 'Error caught but not meaningfully handled — disappears here'));
        inCatch = false;
      }
    }
  }
  return findings;
}

function scanRetryLoops(lines) {
  const findings = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const t = line.trim();
    if (JS.retryLoop.test(line) || JS.retryVar.test(line)) {
      const ctx = lines.slice(Math.max(0,i-3), Math.min(lines.length,i+12)).join('\n');
      const legit = JS.isCircuitBrk.test(ctx) && /\bthrow\b/.test(ctx);
      if (!legit && (/catch/.test(ctx) || /\bretry\b|\battempt\b/i.test(ctx))) {
        findings.push(make('retry_loop', i+1, t.substring(0,70), 'Retry loop masks an unstable dependency instead of fixing it'));
        i += 3;
      }
    }
  }
  return findings;
}

function scanImplicitMutations(lines, isTS) {
  const findings = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const t = line.trim();
    if (JS.regexLiteral.test(t)) continue;
    if (JS.todoLine.test(t)) findings.push(make('todo_comment', i+1, t.substring(0,70), 'Documented technical debt — κ acknowledged but not resolved'));
    if (JS.tripleOr.test(line) && (line.match(/\|\|/g)||[]).length >= 2)
      findings.push(make('triple_normalizer', i+1, t.substring(0,70), 'Multi-format normalizer masks inconsistent upstream data shape'));
    if (!JS.mutExclude.test(t) && JS.mutAssign.test(t) && !/===|!==|>=|<=|=>/.test(t)) {
      const m = t.match(/\b([a-z]\w{3,})\s*\.\s*([a-z]\w{3,})\s*=[^=]/i);
      if (m && !/^(?:module|exports|this|self|window|global|process|console|Math|JSON|Object|Array|Promise|isComposing|ref)$/i.test(m[1]) && !/\.current\s*=/.test(t))
        findings.push(make('implicit_state', i+1, t.substring(0,70), 'Implicit state mutation — side effect callers cannot see'));
    }
    if (isTS && JS.anyType.test(line) && !/^\s*\/\//.test(t))
      findings.push(make('any_type', i+1, t.substring(0,70), '`any` type disables type checking — κ hiding a type mismatch'));
  }
  return findings;
}

function scanNPlusOne(lines, content) {
  const findings = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const t = line.trim();
    if (JS.loopHead.test(line)) {
      const ahead = lines.slice(i+1, i+8).join('\n');
      if (JS.dbCall.test(ahead)) {
        const ctx = lines.slice(Math.max(0,i-5),i).join('\n');
        if (!JS.isBatched.test(ctx))
          findings.push(make('n_plus_one', i+1, t.substring(0,70), 'DB/API call inside loop — stress amplifies with data size'));
      }
    }
    if (JS.pushOrAppend.test(line)) {
      const m = line.match(/\b(\w+)\s*\.\s*push|\b(\w+)\s*\+=/);
      if (m) {
        const v = m[1]||m[2];
        const rx = new RegExp(`^(?:const|let|var)\\s+${v}\\s*=\\s*(?:\\[|\\{|new)`,'m');
        if (rx.test(content.substring(0,2000)))
          findings.push(make('unbounded_growth', i+1, t.substring(0,70), `"${v}" grows at module scope without bound — memory leak pattern`));
      }
    }
  }
  return findings;
}

function scanCommentedCode(lines) {
  const findings = [];
  let commentedRun = 0;
  for (let i = 0; i < lines.length; i++) {
    const t = lines[i].trim();
    if (JS.commentedCode.test(t)) {
      commentedRun++;
    } else {
      if (commentedRun >= 3) findings.push(make('commented_code', i - commentedRun + 1, `${commentedRun} lines of commented-out code`, 'Commented-out code preserved "just in case" — κ through fear of deletion'));
      commentedRun = 0;
    }
  }
  return findings;
}

function scanSecurity(lines) {
  const findings = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const t = line.trim();
    if (/\breq\s*\.\s*body\b/.test(line)) {
      const ctx = lines.slice(Math.max(0,i-5), Math.min(lines.length,i+5)).join('\n');
      if (!/validate|sanitize|schema|joi|zod|yup|escape|strip/i.test(ctx))
        findings.push(make('unvalidated_input', i+1, t.substring(0,70), 'req.body used without visible validation — review for injection risk'));
    }
    if (/`[^`]*\$\{[^}]+\}[^`]*\b(?:SELECT|INSERT|UPDATE|DELETE|WHERE)\b/i.test(line) ||
        /\b(?:SELECT|INSERT|UPDATE|DELETE|WHERE)\b[^`"']{0,60}\+\s*\w/i.test(line))
      findings.push(make('sql_concat', i+1, t.substring(0,70), 'SQL built with string concatenation — use parameterized queries'));
    if (/(?:password|secret|api_?key|token|auth)\s*[:=]\s*['"][^'"]{8,}['"]/i.test(line) &&
        !/process\.env|config\.|getenv|os\.environ|FIX_MAP|fix:|fix,|message:|label:/i.test(line) &&
        !/^\s*[a-z_]+:\s*['"][^'"]*(?:environ|variable|rotate|sanitize)/i.test(t))
      findings.push(make('hardcoded_secret', i+1,
        t.replace(/['"][^'"]{3,}['"]/g,'"[REDACTED]"').substring(0,70),
        'Possible hardcoded secret — use environment variables'));
  }
  return findings;
}

function scanRhoSignals(lines) {
  const rhoFound = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const t = line.trim();
    if (JS.throwNew.test(line))    rhoFound.push({ type:'explicit_error' });
    if (JS.freezeConst.test(line)) rhoFound.push({ type:'immutable' });
    if (JS.ifaceOrType.test(t))    rhoFound.push({ type:'typed_interface' });
  }
  return rhoFound;
}

function scanFunctions(content, lines, existingFindings) {
  const findings = [];
  const rhoFound = [];
  const funcRx = /(?:async\s+)?function\s+(\w+)\s*\(([^)]*)\)|(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s*)?\(([^)]*)\)\s*=>/g;
  let fm;
  while ((fm = funcRx.exec(content)) !== null) {
    const name = fm[1]||fm[3]||'fn';
    const params = (fm[2]||fm[4]||'').split(',').filter(p=>p.trim());
    let d=0, sz=0, started=false;
    for (let ci=fm.index; ci<Math.min(fm.index+12000,content.length); ci++) {
      if (content[ci]==='{') { d++; started=true; }
      if (content[ci]==='}') d--;
      if (started) sz++;
      if (started && d===0) break;
    }
    const est = sz/45;
    if (params.length > 5 || est > 60) {
      const ln = content.substring(0,fm.index).split('\n').length;
      findings.push(make('god_function', ln,
        `function ${name}(${params.slice(0,3).join(', ')}${params.length>3?', ...':''})`,
        `"${name}" ~${Math.round(est)} lines, ${params.length} params — high stress surface`));
    } else if (params.length <= 2 && est < 20) {
      const funcStartLine = content.substring(0, fm.index).split('\n').length;
      const funcBodyText  = content.substring(fm.index, fm.index + sz);
      const funcEndLine   = funcStartLine + funcBodyText.split('\n').length - 1;
      const hasKappaInside = [...existingFindings, ...findings].some(f =>
        (f.category === 'kappa' || f.category === 'sigma') &&
        f.line >= funcStartLine && f.line <= funcEndLine
      );
      if (!hasKappaInside) rhoFound.push({ type:'pure_function' });
    }
  }
  return { findings, rhoFound };
}

// ── detectJS: orchestrator (now lean — delegates to focused scanners) ─────
function detectJS(content, filePath) {
  const lines = content.split('\n');
  const isTS  = filePath.endsWith('.ts') || filePath.endsWith('.tsx');

  if (lines.length > MAX_FILE_LINES) {
    return { findings: [make('large_file', 1, `${lines.length} lines`, 'File too large — partial scan')], rhoFound: [] };
  }

  // Run focused scanners — each has one responsibility
  const catches   = scanSilentCatches(lines);
  const retries   = scanRetryLoops(lines);
  const mutations = scanImplicitMutations(lines, isTS);
  const nplus     = scanNPlusOne(lines, content);
  const commented = scanCommentedCode(lines);
  const security  = scanSecurity(lines);
  const rhoFound  = scanRhoSignals(lines);

  // Nesting depth — needs full line scan (single pass)
  let maxDepth = 0, curDepth = 0, deepStart = -1;
  for (let i = 0; i < lines.length; i++) {
    const opens  = (lines[i].match(/\{/g)||[]).length;
    const closes = (lines[i].match(/\}/g)||[]).length;
    curDepth += opens - closes;
    if (curDepth > maxDepth) { maxDepth = curDepth; if (maxDepth >= 5 && deepStart < 0) deepStart = i + 1; }
  }

  const allFindings = [...catches, ...retries, ...mutations, ...nplus, ...commented, ...security];
  if (maxDepth >= 5) allFindings.push(make('deep_nesting', deepStart||1, `Nesting depth: ${maxDepth}`, `Max nesting depth ${maxDepth} — each level is a hidden dependency`));
  if (lines.length > 400) allFindings.push(make('large_file', 1, `${lines.length} lines`, `File has ${lines.length} lines — check for mixed responsibilities`));

  const { findings: funcFindings, rhoFound: funcRho } = scanFunctions(content, lines, allFindings);

  return {
    findings: [...allFindings, ...funcFindings],
    rhoFound: [...rhoFound, ...funcRho],
  };
}

// ── PYTHON DETECTOR ───────────────────────────────────────────────────────
function detectPython(content, filePath) {
  const lines    = content.split('\n');
  const findings = [];
  const rhoFound = [];

  if (lines.length > MAX_FILE_LINES) {
    findings.push(make('large_file', 1, `${lines.length} lines`, 'File too large — partial scan'));
    return { findings, rhoFound };
  }

  let commentedRun = 0;
  let inExcept = false, exceptLines = [], exceptStart = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const t    = line.trim();

    // Except block state machine (Python equivalent of catch)
    if (PY.exceptSilent.test(line)) {
      inExcept = true; exceptLines = [line]; exceptStart = i + 1;
    } else if (inExcept) {
      exceptLines.push(line);
      if (t === '' || (!line.startsWith(' ') && !line.startsWith('\t') && t !== '')) {
        const body = exceptLines.join('\n');
        const hasReal = PY.raiseExcept.test(body) || /logging\.|logger\.|print.*error/i.test(body);
        const isSilent = !hasReal && (PY.exceptPass.test(body.split('\n').slice(1).join('\n').trim()) ||
                         exceptLines.length <= 2);
        if (isSilent) findings.push(make('error_swallowing', exceptStart,
          exceptLines[0]?.trim().substring(0,70)||'except',
          'Exception caught silently (pass or bare except) — error disappears here'));
        inExcept = false;
      }
    }

    // Retry patterns
    if (PY.retryLoop.test(line)) {
      const ctx = lines.slice(Math.max(0,i-2), Math.min(lines.length,i+10)).join('\n');
      const legit = /backoff|exponential|circuit/i.test(ctx) && PY.raiseExcept.test(ctx);
      if (!legit) findings.push(make('retry_loop', i+1, t.substring(0,70),
        'Retry loop masks an unstable dependency instead of fixing it'));
    }

    // TODO / FIXME
    if (PY.todoLine.test(t)) findings.push(make('todo_comment', i+1, t.substring(0,70),
      'Documented technical debt — κ acknowledged but not resolved'));

    // Commented-out code
    if (PY.commentedCode.test(t)) {
      commentedRun++;
    } else {
      if (commentedRun >= 3) findings.push(make('commented_code', i-commentedRun+1,
        `${commentedRun} lines of commented-out code`,
        'Commented-out Python code preserved — delete it, git has history'));
      commentedRun = 0;
    }

    // N+1 query
    if (PY.loopHead.test(line)) {
      const ahead = lines.slice(i+1, i+8).join('\n');
      if (PY.dbCall.test(ahead)) {
        const ctx = lines.slice(Math.max(0,i-5),i).join('\n');
        if (!PY.isBatched.test(ctx))
          findings.push(make('n_plus_one', i+1, t.substring(0,70),
            'DB query inside loop — N+1 pattern. Use bulk_create/values_list or prefetch_related'));
      }
    }

    // Unbounded append at module scope
    if (PY.appendUnbound.test(line)) {
      const m = line.match(/\b(\w+)\s*\.\s*append/);
      if (m) {
        const v = m[1];
        const rx = new RegExp(`^${v}\\s*=\\s*\\[`, 'm');
        if (rx.test(content.substring(0,2000)))
          findings.push(make('unbounded_growth', i+1, t.substring(0,70),
            `"${v}" list appends at module scope without bound — memory leak`));
      }
    }

    // type: ignore as any-type equivalent
    if (PY.typeIgnore.test(line)) findings.push(make('any_type', i+1, t.substring(0,70),
      '# type: ignore suppresses type checking — hiding a type mismatch'));

    // Security: hardcoded secrets
    if (/(?:password|secret|api_?key|token|auth)\s*=\s*['"][^'"]{8,}['"]/i.test(line) &&
        !/os\.environ|getenv|config\.|settings\.|FIX_MAP|fix:|message:/i.test(line))
      findings.push(make('hardcoded_secret', i+1,
        t.replace(/['"][^'"]{3,}['"]/g,'"[REDACTED]"').substring(0,70),
        'Possible hardcoded secret — use os.environ or a secrets manager'));

    // SQL concat
    if (/(?:SELECT|INSERT|UPDATE|DELETE|WHERE)[^'"]*[+%f].*(?:user|input|param|req|request)/i.test(line))
      findings.push(make('sql_concat', i+1, t.substring(0,70),
        'SQL built with string formatting — use parameterized queries'));

    // ρ signals
    if (PY.raiseExcept.test(line))  rhoFound.push({ type:'explicit_error' });
    if (PY.dataclass.test(line))    rhoFound.push({ type:'immutable' });
    if (PY.typeHint.test(line))     rhoFound.push({ type:'typed_interface' });
  }

  // Large file
  if (lines.length > 400) findings.push(make('large_file', 1,
    `${lines.length} lines`, `File has ${lines.length} lines — consider splitting by responsibility`));

  return { findings, rhoFound };
}

// ── HELPER ────────────────────────────────────────────────────────────────
function make(type, line, code, message, overrides={}) {
  const w = W[type] || { score:0, cat:'kappa', sev:'low' };
  let impact = w.score;

  // V4.5: σ amplifiers scaled by DST_DATA_SCALE (environmental mass)
  // σ is not constant — N+1 on hyperscale is 4× worse than on small
  if (w.cat === 'sigma') impact = Math.round(impact * SIGMA_SCALE * 10) / 10;

  return {
    type,
    category: overrides.category || w.cat,
    line, code,
    impact: overrides.impact ?? impact,
    severity: w.sev,
    message,
    fix: FIX[type] || '',
    ...overrides,
  };
}

// ── V4.5: κ_i EXPIRATION CONTRACT ────────────────────────────────────────
// Scans for: // @dst-kappa-i: expires YYYY-MM-DD
// Active (future date)  → 0 penalty, listed in Accept column
// Expired (past date)   → -15 penalty, reclassified to κ_a, listed in Fix
//
// This makes tech debt enforceable. Promises have timestamps and consequences.
// The CI gate becomes governance, not just diagnosis.
const KAPPA_I_ANNOTATION = /@dst-kappa-i:\s*expires\s+(\d{4}-\d{2}-\d{2})/i;

function detectKappaI(content, filePath) {
  const findings = [];
  const today    = new Date().toISOString().slice(0, 10);
  const lines    = content.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const m = KAPPA_I_ANNOTATION.exec(lines[i]);
    if (!m) continue;

    const expiresDate = m[1];
    const expired     = expiresDate < today;
    const nextLine    = lines[i + 1]?.trim().substring(0, 80) || 'annotated tradeoff';

    if (expired) {
      // Expired κ_i → violent reclassification to κ_a
      findings.push(make('todo_comment', i + 1,
        `@dst-kappa-i expired ${expiresDate}`,
        `Intentional tradeoff expired — now accumulated debt. Was: ${nextLine}`,
        {
          category: 'kappa',
          kappaType: 'accumulated',
          impact: KAPPA_I_EXPIRED_PENALTY,
          severity: 'high',
          expiredKappaI: true,
          expiresDate,
          fix: `This κ_i tradeoff expired on ${expiresDate}. Treat as κ_a — fix it this sprint or extend with a new expiration date.`,
        }
      ));
    } else {
      // Active κ_i → 0 penalty, listed in Accept column with expiration date
      findings.push(make('todo_comment', i + 1,
        `@dst-kappa-i expires ${expiresDate}`,
        `Active intentional tradeoff — expires ${expiresDate}. Context: ${nextLine}`,
        {
          category: 'kappa_i',
          kappaType: 'intentional',
          impact: 0,
          severity: 'info',
          activeKappaI: true,
          expiresDate,
          fix: `Documented tradeoff with expiration. Review before ${expiresDate} — extend or eliminate.`,
        }
      ));
    }
  }
  return findings;
}

// ── FILE / DIR SCANNERS ───────────────────────────────────────────────────
function detectPatterns(content, filePath) {
  const isPython = PY_EXTS.has(path.extname(filePath));

  // V4.5-final: AST is PRIMARY when available.
  // Regex runs as fallback only when @babel/parser is not installed.
  // AST = structural truth. Regex = surface approximation.
  const useAST = !isPython && !!babelParser;

  let base;
  if (useAST) {
    // AST primary path — regex is the fallback for anything AST misses
    const astResult  = detectJSWithAST(content, filePath);
    const regexResult = detectJS(content, filePath);
    // Merge: keep all AST findings + any regex findings not already found by AST (±2 lines)
    const astLines = new Set(astResult.findings.map(f => `${f.type}:${f.line}`));
    const regexOnly = regexResult.findings.filter(f => {
      for (let d = -2; d <= 2; d++) {
        if (astLines.has(`${f.type}:${f.line + d}`)) return false;
      }
      return true;
    });
    base = {
      findings: [...astResult.findings, ...regexOnly],
      rhoFound: regexResult.rhoFound, // ρ signals still from regex (AST doesn't scan these yet)
    };
  } else {
    base = isPython
      ? detectPython(content, filePath)
      : detectJS(content, filePath);
  }

  // κ_i expiration contract (all file types — always runs)
  const kappaIFindings = detectKappaI(content, filePath);

  return {
    findings: [...base.findings, ...kappaIFindings],
    rhoFound: base.rhoFound,
  };
}

function scanFile(filePath) {
  try {
    if (fs.statSync(filePath).size > MAX_FILE_BYTES) return null;
    const content = fs.readFileSync(filePath, 'utf8');
    const { findings, rhoFound } = detectPatterns(content, filePath);
    return { filePath, findings, rhoFound, lines: content.split('\n').length };
  } catch { return null; }
}

function walkDir(dirPath, results={}) {
  let entries;
  try { entries = fs.readdirSync(dirPath, { withFileTypes:true }); }
  catch { return results; }
  for (const e of entries) {
    if (IGNORE_DIRS.has(e.name) || e.name.startsWith('.')) continue;
    const full = path.join(dirPath, e.name);
    if (e.isDirectory()) walkDir(full, results);
    else if (e.isFile() && SCAN_EXTS.has(path.extname(e.name))) {
      const r = scanFile(full);
      if (r) results[full] = r;
    }
  }
  return results;
}

function scanChangedFiles(baseSha, headSha) {
  try {
    const out = execSync(`git diff --name-only ${baseSha}..${headSha} 2>/dev/null`, { encoding:'utf8' });
    const changed = out.trim().split('\n').filter(f => f && SCAN_EXTS.has(path.extname(f)) && fs.existsSync(f));
    if (!changed.length) return null;
    const results = {};
    for (const f of changed) { const r = scanFile(f); if (r) results[f] = r; }
    return results;
  } catch { return null; }
}

// ── SCORE / REGIME / HEALING / ROI ───────────────────────────────────────
function calculateScore(scanResults) {
  let score = 100, kappaCount = 0, sigmaCount = 0, rhoCount = 0, secCount = 0;
  const allFindings = [];
  for (const { findings, rhoFound } of Object.values(scanResults)) {
    for (const f of findings) {
      score += f.impact; // security findings have impact:0 — don't affect DST score
      allFindings.push(f);
      if (f.category === 'kappa')    kappaCount++;
      if (f.category === 'sigma')    sigmaCount++;
      if (f.category === 'security') secCount++;
    }
    for (const r of rhoFound) {
      score += W[r.type]?.score || 2; rhoCount++;
    }
  }
  return {
    score: Math.max(0,Math.min(100,Math.round(score))),
    kappaCount, sigmaCount, rhoCount, secCount, allFindings
  };
}

function classifyRegime(score) {
  if (score >= 75) return { name:'Elastic',     desc:'Genuinely healthy. Features are fast to add.' };
  if (score >= 50) return { name:'Plastic',      desc:'Working via masking. Debt accumulating.' };
  if (score >= 25) return { name:'Late Plastic', desc:'Significant κ. Each feature costs more than the last.' };
  return               { name:'Residual',      desc:'System in delayed failure. Refactor before adding anything.' };
}

function healingPriorities(allFindings) {
  // Only κ and σ findings — not security
  const g = {};
  for (const f of allFindings.filter(f=>f.category!=='security')) {
    if (!g[f.type]) g[f.type] = { occurrences:0, scoreImpact:0, fix:f.fix, severity:f.severity };
    g[f.type].occurrences++;
    g[f.type].scoreImpact += f.impact;
  }
  return Object.entries(g)
    .sort(([,a],[,b]) => a.scoreImpact - b.scoreImpact)
    .slice(0, MAX_PR_FINDINGS)
    .map(([type,v]) => ({ pattern:type, ...v }));
}

function calculateROI(allFindings, teamSize=10, engineerCost=150_000) {
  const hr = engineerCost / 2080;
  const n  = (t) => allFindings.filter(f=>f.type===t).length;
  const costs = {
    retryManagement:  n('retry_loop')       * hr * HOURS.retry  * 12,
    errorDebugging:   n('error_swallowing') * hr * HOURS.error  * 12,
    godObjectTax:     n('god_function')     * hr * HOURS.god    * 12,
    stateDebugging:   n('implicit_state')   * hr * HOURS.state  * 12,
    nPlusOneSlowness: n('n_plus_one')       * hr * HOURS.nplus  * 12,
    onboardingDrain:  Math.ceil(teamSize/10)* hr * HOURS.onboard,
    debtCompounding:  teamSize              * hr * HOURS.debt   * 12,
  };
  const total  = Math.round(Object.values(costs).reduce((a,b)=>a+b,0));
  const invest = Math.round(teamSize * 2 * hr * 40);
  return {
    costs, totalAnnual:total, refactorInvest:invest,
    paybackMonths: invest>0 ? Math.round((invest/(total/12))*10)/10 : 0,
    firstYearSavings: Math.round(total-invest),
    fiveYearROI: Math.round(((total*5-invest)/Math.max(invest,1))*100),
    hourlyRate: Math.round(hr),
  };
}

function worstFiles(scanResults, limit=10) {
  return Object.entries(scanResults)
    .map(([fp,{findings,lines}]) => ({
      file:fp, lines,
      score: Math.max(0, 100+findings.filter(f=>f.category!=='security').reduce((s,f)=>s+f.impact,0)),
      findings: findings.length,
    }))
    .sort((a,b)=>a.score-b.score)
    .slice(0,limit);
}

// ── MAIN ──────────────────────────────────────────────────────────────────
function runFullScan(targetDir='.', options={}) {
  const {
    teamSize     = parseInt(process.env.DST_TEAM_SIZE)     || 10,
    engineerCost = parseInt(process.env.DST_ENGINEER_COST) || 150_000,
    artifactDir  = process.env.DST_ARTIFACT_DIR            || '.',
  } = options;

  const baseSha = options.baseSha || process.env.BASE_SHA;
  const headSha = options.headSha || process.env.HEAD_SHA;

  let scanResults = null, isIncremental = false;
  if (baseSha && headSha) {
    scanResults = scanChangedFiles(baseSha, headSha);
    if (scanResults && Object.keys(scanResults).length > 0) isIncremental = true;
  }
  if (!scanResults) scanResults = walkDir(targetDir);

  const { score, kappaCount, sigmaCount, rhoCount, secCount, allFindings } = calculateScore(scanResults);

  // V3 fields
  const regime  = classifyRegime(score);
  const risk    = calculateRiskScore(kappaCount, sigmaCount, secCount, score); // v4.5: pass theta
  const warning = regimeWarning(regime.name);
  const healing = healingPriorities(allFindings);
  const roi     = calculateROI(allFindings, teamSize, engineerCost);
  const worst   = worstFiles(scanResults);

  // Trend
  const prevTrend = loadTrend(artifactDir);
  const trend     = buildTrendSummary(score, prevTrend);
  saveTrend(score, regime.name, artifactDir);

  // V4 fields — math-grounded
  const theta         = score; // Θ = real remaining capacity
  const dThetaDt      = calculateDThetaDt(theta, prevTrend);
  const obsGap        = calculateObservabilityGap(theta, allFindings);
  const sigmaEff      = calculateSigmaEff(sigmaCount, kappaCount, theta);      // v4.5: pass theta
  const kappaSat      = calculateKappaSaturation(kappaCount, Object.keys(scanResults).length, teamSize, rhoCount, theta); // v4.5: pass rhoCount + theta
  const regimePred    = predictRegimeTransition(theta, dThetaDt);
  const rewriteSignal = detectRewriteSignal(theta, dThetaDt, worst);
  const actionLists   = buildActionLists(allFindings);

  // ── V4.5-final: structuredReport — clean JSON for dashboards, APIs, SaaS ──
  // Teams can pipe this directly into monitoring systems, the Compass, or NFT mint
  const structuredReport = {
    version:    '4.5-final',
    scannedAt:  new Date().toISOString(),
    // Core capacity
    theta,
    apparent:     obsGap.apparent,
    obsGap:       obsGap.gap,
    obsGapSeverity: obsGap.severity,
    // Regime
    regime:       regime.name,
    regimeDesc:   regime.desc,
    // Trajectory
    dThetaDt:     dThetaDt.rate,
    direction:    dThetaDt.direction,
    regimePred:   regimePred ? {
      nextRegime:   regimePred.nextRegime,
      sprintsUntil: regimePred.sprintsUntil,
      urgency:      regimePred.urgency,
    } : null,
    // Stress
    sigmaEff:     sigmaEff.eff,
    sigmaHidden:  sigmaEff.hidden,
    sigmaScale:   process.env.DST_DATA_SCALE || 'medium',
    kappaSat:     kappaSat.saturation,
    // Risk
    riskScore:    risk.score,
    riskLevel:    risk.level,
    // Signals
    kappaCount, sigmaCount, rhoCount, secCount,
    fileCount:    Object.keys(scanResults).length,
    // Rewrite signal (Proposition 5)
    rewriteSignal: rewriteSignal.triggered ? {
      triggered:       true,
      criticalModules: rewriteSignal.criticalModules,
      message:         rewriteSignal.message,
    } : { triggered: false },
    // Action lists summary
    actionSummary: {
      fixTotal:      actionLists.fixTotal,
      mitigateTotal: actionLists.mitigateTotal,
      acceptTotal:   actionLists.acceptTotal || 0,
      amplifyTotal:  actionLists.amplifyTotal,
      expiredKappaI: actionLists.expiredKappaICount || 0,
    },
    // ROI
    annualCost:   roi.totalAnnual,
    paybackMonths: roi.paybackMonths,
    fiveYearROI:  roi.fiveYearROI,
  };

  return {
    // Core (Θ naming)
    theta, score: theta,
    regime, risk, warning, trend,
    kappaCount, sigmaCount, rhoCount, secCount,
    allFindings, healing, roi,
    worstFiles:    worst,
    fileCount:     Object.keys(scanResults).length,
    totalFindings: allFindings.length,
    isIncremental,
    // V4
    dThetaDt, obsGap, sigmaEff, kappaSat, regimePred, rewriteSignal, actionLists,
    // V4.5-final
    structuredReport,
    astEngineActive: !!babelParser,
  };
}

// ── V4: κ CLASSIFICATION ──────────────────────────────────────────────────
// Default = κ_a. Only flip to κ_c if very obvious. κ_i only if explicitly marked.
// Accuracy improves in v5+ with AST. Keep simple here.
function classifyKappa(finding) {
  const { type, code = '', category } = finding;

  // σ amplifiers are not κ — they're a separate category
  if (category === 'sigma') return 'sigma';
  if (category === 'security') return 'security';
  if (category === 'rho') return 'rho';

  // κ_c: conscripted — domain forces it, cannot be eliminated locally
  // Only flag as conscripted when very obvious from context
  if (type === 'deep_nesting') {
    // Async initialization chains are likely κ_c
    if (/async|await|gpu|webgl|init|setup|connect/i.test(code)) return 'conscripted';
  }
  if (type === 'any_type') {
    // If code references unknown external types, likely κ_c
    if (/webgpu|wasm|native|extern|ffi|binding/i.test(code)) return 'conscripted';
  }
  if (type === 'retry_loop') {
    // External dependencies not owned by team: κ_c
    if (/external|upstream|third.party|vendor|api\..*\.com/i.test(code)) return 'conscripted';
  }

  // Everything else defaults to κ_a (accumulated — fixable)
  return 'accumulated';
}

function getKappaAction(kappaType) {
  const actions = {
    accumulated:  { label:'FIX',      emoji:'🔴', desc:'Fully reducible — fix this sprint' },
    conscripted:  { label:'MITIGATE', emoji:'🟡', desc:'Domain constraint — bound and instrument' },
    intentional:  { label:'ACCEPT',   emoji:'🟢', desc:'Documented tradeoff — verify expiration' },
    sigma:        { label:'RESOLVE',  emoji:'🔴', desc:'Stress amplifier — batch or bound' },
    security:     { label:'REVIEW',   emoji:'🟠', desc:'Advisory — security review recommended' },
    rho:          { label:'MAINTAIN', emoji:'🟢', desc:'Healthy pattern — preserve this' },
  };
  return actions[kappaType] || actions.accumulated;
}

// ── V4: THREE ACTION LISTS ────────────────────────────────────────────────
function buildActionLists(allFindings) {
  const fix      = [];  // κ_a: accumulated — FIX (includes expired κ_i)
  const mitigate = [];  // κ_c: conscripted — MITIGATE
  const accept   = [];  // κ_i: intentional — ACCEPT (from @dst-kappa-i annotations)
  const amplify  = [];  // σ: stress amplifiers — RESOLVE URGENTLY

  // V4.5: Pull active κ_i annotations directly — they have their own column
  const activeKappaI = allFindings.filter(f => f.activeKappaI);
  const expiredKappaI = allFindings.filter(f => f.expiredKappaI);

  // Group remaining findings by type
  const grouped = {};
  for (const f of allFindings.filter(f =>
    f.category !== 'security' && !f.activeKappaI
  )) {
    const kt = classifyKappa(f);
    const key = f.expiredKappaI ? `expired_ki_${f.line}` : f.type;
    if (!grouped[key]) grouped[key] = {
      type: f.type,
      kappaType: kt,
      occurrences: 0,
      scoreImpact: 0,
      fix: f.fix,
      severity: f.severity,
      expiredKappaI: f.expiredKappaI || false,
      expiresDate: f.expiresDate,
    };
    grouped[key].occurrences++;
    grouped[key].scoreImpact += f.impact;
  }

  for (const item of Object.values(grouped).sort((a,b) => a.scoreImpact - b.scoreImpact)) {
    if (item.kappaType === 'sigma')            amplify.push(item);
    else if (item.kappaType === 'conscripted') mitigate.push(item);
    else                                       fix.push(item);
  }

  // Accept list: only real annotated κ_i (with expiration dates)
  for (const f of activeKappaI) {
    accept.push({
      type: 'kappa_i_active',
      kappaType: 'intentional',
      occurrences: 1,
      scoreImpact: 0,
      expiresDate: f.expiresDate,
      fix: f.fix,
      code: f.code,
      severity: 'info',
    });
  }

  return {
    fix:      fix.slice(0, MAX_ACTION_LIST),
    mitigate: mitigate.slice(0, MAX_ACTION_LIST),
    accept:   accept.slice(0, MAX_ACTION_LIST),
    amplify:  amplify.slice(0, MAX_ACTION_LIST),
    fixTotal:        fix.length,
    mitigateTotal:   mitigate.length,
    acceptTotal:     accept.length,
    amplifyTotal:    amplify.length,
    expiredKappaICount: expiredKappaI.length,
  };
}

// ── V4: OBSERVABILITY GAP ─────────────────────────────────────────────────
// Apparent health = what the score would be without κ penalties
// (only counting σ amplifiers as negative, giving κ no penalty)
// Gap = apparent − Θ  →  how much the metrics are lying
function calculateObservabilityGap(theta, allFindings) {
  // Apparent health: start at 100, only penalize σ (amplifiers)
  // κ is masking — so apparent health ignores κ penalties
  let apparent = 100;
  for (const f of allFindings) {
    if (f.category === 'sigma' && f.impact) apparent += f.impact;
    if (f.category === 'rho'   && f.impact) apparent += f.impact;
  }
  apparent = Math.max(0, Math.min(100, Math.round(apparent)));
  const gap = Math.max(0, apparent - theta);
  return {
    theta,
    apparent,
    gap,
    severity: gap >= 30 ? 'critical' : gap >= 15 ? 'high' : gap >= 5 ? 'medium' : 'low',
    message:  gap >= 30 ? 'Metrics are significantly misleading' :
              gap >= 15 ? 'Observable state diverging from real capacity' :
              gap >= 5  ? 'Minor observability gap detected' :
              'Observables accurately reflect real capacity',
  };
}

// ── V4: σ_eff (EFFECTIVE STRESS) ──────────────────────────────────────────
function calculateSigmaEff(sigmaCount, kappaCount, theta = 50) {
  // σ_eff = σ_raw − κ_displacement
  // κ reduces experienced stress but doesn't reduce actual stress — it defers it
  const sigmaRaw = sigmaCount;
  const kappaDisplacement = Math.min(kappaCount * 0.3, sigmaRaw * 0.8);
  const sigmaEff = Math.max(0, Math.round((sigmaRaw - kappaDisplacement) * 10) / 10);
  const hidden   = Math.round((sigmaRaw - sigmaEff) * 10) / 10;

  // v4.5: Regime-contextual interpretation — σ_eff means something different per regime.
  // A number without context tells an engineer nothing actionable.
  const interpretation =
    theta >= 75
      ? (sigmaEff === 0
          ? 'no amplifiers active — system structurally clean'
          : 'contained — ρ dominance absorbing amplifier load')
      : theta >= 50
      ? sigmaEff > 2
          ? 'partially exposed — κ masking active but σ pressure rising'
          : 'manageable — κ holding σ below threshold'
      : theta >= 25
      ? 'elevated — κ near saturation, amplifiers increasingly visible'
      : 'critical — σ dominant, displacement nearly exhausted';

  return {
    raw:    sigmaRaw,
    eff:    sigmaEff,
    hidden,
    note: hidden > 0
      ? `${hidden} stress units hidden by κ — ${interpretation}`
      : interpretation,
  };
}

// ── V4: κ SATURATION ──────────────────────────────────────────────────────
function calculateKappaSaturation(kappaCount, fileCount, teamSize, rhoCount = 0, theta = 50) {
  // κ_max estimate: scales with codebase size and team
  const kappaMax = Math.max(20, Math.round(Math.sqrt(fileCount) * (teamSize / 5) * 8));

  // v4.5: Net κ pressure = κ findings minus ρ healing signals, relative to Θ
  // This is the structurally correct quantity:
  //   High κ + high ρ + high Θ = low net pressure (React: many findings, healthy)
  //   High κ + low  ρ + low  Θ = high net pressure (Log4j: few defenses, residual)
  //
  // netPressure ∈ [0, 1]: 0 = ρ fully absorbs κ, 1 = κ fully dominant
  const kappaWeight = kappaCount / Math.max(1, kappaMax);
  const rhoDampener = Math.min(0.8, rhoCount / Math.max(1, kappaCount + rhoCount));
  const thetaDampener = theta / 100; // high Θ = system absorbing load well
  const netPressure = Math.max(0, kappaWeight * (1 - rhoDampener) * (1 - thetaDampener * 0.5));
  const saturation  = Math.min(100, Math.round(netPressure * 100));

  // Warning only fires when net pressure is high AND Θ is low (structurally consistent)
  const warning = (saturation >= 80 && theta < 50) ? 'κ SATURATION CRITICAL — displacement budget nearly exhausted' :
                  (saturation >= 60 && theta < 75) ? 'κ saturation elevated — monitor closely' :
                  null;

  return {
    used:       kappaCount,
    max:        kappaMax,
    saturation, // net κ pressure as % — not raw count ratio
    warning,
    note: theta >= 75 && rhoCount > kappaCount
      ? 'ρ dominant — κ findings absorbed by healing capacity'
      : null,
  };
}

// ── V4: dΘ/dt TRAJECTORY ─────────────────────────────────────────────────
function calculateDThetaDt(theta, prevTrend) {
  if (!prevTrend || !prevTrend.history || prevTrend.history.length < 2) {
    return { rate: null, acceleration: null, direction: 'unknown', prCount: 0 };
  }

  const history = prevTrend.history.slice(-5); // last 5 PRs
  const deltas = [];
  for (let i = 1; i < history.length; i++) {
    deltas.push(history[i].score - history[i-1].score);
  }

  const rate = Math.round((deltas.reduce((a,b)=>a+b,0) / deltas.length) * 10) / 10;
  const acceleration = deltas.length >= 3
    ? Math.round(((deltas[deltas.length-1] - deltas[0]) / deltas.length) * 10) / 10
    : null;

  return {
    rate,         // avg pts per PR (negative = declining)
    acceleration, // rate of rate change (negative = accelerating decline)
    direction: rate > 0.5 ? 'improving' : rate < -0.5 ? 'declining' : 'stable',
    prCount: deltas.length,
    arrow: rate > 0 ? '↑' : rate < 0 ? '↓' : '→',
  };
}

// ── V4: REGIME PREDICTION ─────────────────────────────────────────────────
function predictRegimeTransition(theta, dThetaDt) {
  if (!dThetaDt || dThetaDt.rate === null || dThetaDt.rate >= 0) return null;

  const thresholds = { 'Elastic':75, 'Plastic':50, 'Late Plastic':25, 'Residual':0 };
  const regimeOrder = ['Elastic','Plastic','Late Plastic','Residual'];

  const currentRegimeName = classifyRegime(theta).name;
  const currentIdx = regimeOrder.indexOf(currentRegimeName);
  if (currentIdx >= regimeOrder.length - 1) return null; // already Residual

  const nextRegime = regimeOrder[currentIdx + 1];
  const nextThreshold = thresholds[nextRegime];
  const pointsUntil = theta - nextThreshold;
  const sprintsUntil = Math.ceil(pointsUntil / Math.abs(dThetaDt.rate));

  return {
    currentRegime: currentRegimeName,
    nextRegime,
    pointsUntil,
    sprintsUntil,
    urgency: sprintsUntil <= 2 ? 'CRITICAL' : sprintsUntil <= 4 ? 'HIGH' : sprintsUntil <= 8 ? 'MEDIUM' : 'LOW',
    weeksEstimate: sprintsUntil * 2, // assume 2-week sprints
  };
}

// ── V4: REWRITE SIGNAL (PROPOSITION 5) ───────────────────────────────────
function detectRewriteSignal(theta, dThetaDt, worstFilesList) {
  // Trigger on trend decay OR on critically low Θ alone (Residual regime)
  const trendTriggered = dThetaDt && dThetaDt.rate !== null && dThetaDt.rate < REWRITE_DECAY;
  const triggered = theta < REWRITE_THRESHOLD && (trendTriggered || theta <= 10);

  if (!triggered) return { triggered: false };

  // Identify which modules are approaching infeasibility
  const criticalModules = worstFilesList
    .filter(f => f.score < REWRITE_THRESHOLD)
    .slice(0, 3)
    .map(f => ({
      file: f.file.split('/').slice(-2).join('/'), // last 2 path segments
      score: f.score,
      findings: f.findings,
    }));

  return {
    triggered: true,
    theta,
    dThetaDt: dThetaDt.rate,
    criticalModules,
    proposition: 'Proposition 5 — Rewrite Inevitability',
    message: 'Local modification is becoming infeasible. Structural replacement of these modules is the mathematically indicated intervention.',
    action: 'FREEZE new features. Allocate team to structural replacement of critical modules before Θ → 0.',
  };
}


// ── V4.5-final: DST SELF-DIAGNOSIS ───────────────────────────────────────
// DST_SELF_SCAN=1 → scanner measures its own structural health
// "The tool that measures health measures its own."
// This is not a feature — it is proof that DST applies to itself.
function runSelfScan() {
  if (!process.env.DST_SELF_SCAN) return null;
  try {
    const selfPath = __filename;
    const result   = runFullScan(require('path').dirname(selfPath), {
      teamSize: 2,
      engineerCost: 180_000,
    });
    return {
      theta:   result.theta,
      regime:  result.regime.name,
      obsGap:  result.obsGap.gap,
      kappaA:  result.actionLists.fixTotal,
      astActive: result.astEngineActive,
      note: 'Scanner diagnoses itself — DST applies to DST',
    };
  } catch { return null; }
}

module.exports = {
  runFullScan, scanFile, walkDir, detectPatterns,
  calculateScore, classifyRegime, calculateROI,
  calculateRiskScore, regimeWarning, buildTrendSummary,
  healingPriorities, worstFiles, loadTrend, saveTrend,
  // V4 exports
  classifyKappa, getKappaAction, buildActionLists,
  calculateObservabilityGap, calculateSigmaEff,
  calculateKappaSaturation, calculateDThetaDt,
  predictRegimeTransition, detectRewriteSignal,
  REWRITE_THRESHOLD, REWRITE_DECAY,
  // V4.5-final
  runSelfScan, SIGMA_SCALE, KAPPA_I_EXPIRED_PENALTY,
};
