import Store from 'mocks/Store';
import IStore from '../include/IStore';
import { combineReducers, createStore } from 'redux';
import reducers from './redux/reducers';
import * as dotprop from 'dot-prop-immutable';



class ReduxStore implements IStore {
  store: any;
  dispatch: any;
  getState: any;

  constructor() {
    const global = (state: any = {}, action: any = {}) => {
      if (action.type === 'set') {
        const { path, value } = action.payload;
        if (path) {
          if (typeof value === 'function') {
            if (dotprop.get(state, path)) {
              return dotprop.set(state, path, value);
            }
            return dotprop.set(state, path, typeof value === 'function' ? value(undefined) : value);
          }
          return dotprop.set(state, path, value);
        }
      }
      return state;
    }
    
    const combinedReducers = combineReducers({ ...reducers, global });
    const store = createStore(combinedReducers);
    
    // @ts-ignore
    window.store = store;
    const { dispatch, getState } = store;
    this.store = store;
    this.dispatch = dispatch;
    this.getState = getState;
  }

  getProvider() {
    return this.store;
  }

  set(path: string, value: any): void {
    this.dispatch({
      type: 'set', payload: {
        path, value
      }
    });
  }

  remove(path: string): boolean {
    throw new Error('Method not implemented.');
  }
}

export default ReduxStore;