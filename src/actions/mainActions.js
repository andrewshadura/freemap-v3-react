export function setActivePopup(activePopup) {
  return { type: 'SET_ACTIVE_POPUP', activePopup };
}

export function closePopup() {
  return { type: 'CLOSE_POPUP' };
}

export function setTool(tool) {
  return { type: 'SET_TOOL', tool };
}

export function setHomeLocation(homeLocation) {
  return { type: 'SET_HOME_LOCATION', homeLocation };
}

export function startProgress() {
  return { type: 'START_PROGRESS' };
}

export function stopProgress() {
  return { type: 'STOP_PROGRESS' };
}
