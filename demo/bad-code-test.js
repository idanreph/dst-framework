/**
 * bad-code-test.js
 * 
 * A synthetic codebase with known DST stress patterns.
 * Used to validate the DST scanner detects the right signals.
 * 
 * DST signals present in this file:
 *   - κ (masking): errors silently caught and suppressed
 *   - σ (stress loops): circular-looking dependency chain
 *   - ρ (healing): no error recovery or circuit breakers
 *   - Θ (capacity): overloaded single function doing everything
 */

// === κ MASKING: Silent error suppression ===
function fetchUserData(userId) {
  try {
    // Simulate data fetch
    if (!userId) throw new Error('No user ID');
    return { id: userId, name: 'Test User' };
  } catch (e) {
    // κ signal: error silently swallowed — stress hidden from system
    return null;
  }
}

// === σ STRESS LOOP: A → B → C → A (circular dependency chain) ===
function processAuth(session) {
  const user = validateSession(session);   // calls validateSession
  return authorizeUser(user);              // calls authorizeUser
}

function validateSession(session) {
  if (!session) return processAuth(null);  // σ signal: calls back to processAuth
  return { valid: true, session };
}

function authorizeUser(user) {
  if (!user) return validateSession(null); // σ signal: another loop entry
  return { authorized: true, user };
}

// === ρ LOW HEALING: No recovery, no circuit breakers ===
function callExternalService(endpoint) {
  // ρ signal: no retry, no fallback, no timeout — zero healing capacity
  // NOTE: intentionally uses bare fetch (no import, no error handling) to demonstrate the signal
  const result = fetch(endpoint); // eslint-disable-line no-undef
  return result;
}

// === Θ LOW CAPACITY: One function doing everything ===
function handleRequest(req) {
  // Θ signal: auth + data + transform + response in one place
  const session = req.headers['x-session'];
  const auth = processAuth(session);
  const data = fetchUserData(auth && auth.user && auth.user.id);
  const transformed = data ? { ...data, timestamp: Date.now() } : {};
  const response = JSON.stringify(transformed);
  return response;
}

module.exports = { fetchUserData, processAuth, validateSession, authorizeUser, callExternalService, handleRequest };
