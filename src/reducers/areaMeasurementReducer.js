import update from 'immutability-helper';
import * as at from 'fm3/actionTypes';

const initialState = {
  points: [],
};

export default function areaMeasurement(state = initialState, action) {
  switch (action.type) {
    case at.CLEAR_MAP:
      return initialState;
    case at.AREA_MEASUREMENT_ADD_POINT:
      return update(state, { points: { $splice: [[action.payload.position === undefined ? state.points.length : action.payload.position, 0, action.payload.point]] } });
    case at.AREA_MEASUREMENT_UPDATE_POINT:
      return update(state, { points: { [action.payload.index]: { $set: action.payload.point } } });
    case at.AREA_MEASUREMENT_REMOVE_POINT:
      return { ...state, points: state.points.filter(({ id }) => id !== action.payload) };
    case at.AREA_MEASUREMENT_SET_POINTS:
      return { ...state, points: action.payload };
    default:
      return state;
  }
}
