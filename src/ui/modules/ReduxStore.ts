import Store from 'mocks/Store';
import IStore from '../include/IStore';
import { combineReducers, createStore } from 'redux';
import reducers from './redux/reducers';
import * as dotprop from 'dot-prop-immutable';



const DEFAULT_GLOBAL_STORE: any = {
  isSideMenuOpen: true,
}

class ReduxStore implements IStore {
  store: any;
  dispatch: any;
  getState: any;

  constructor() {
    const global = (state: any = DEFAULT_GLOBAL_STORE, action: any = {}) => {
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
      if (action.type === 'unset') {
        const { path } = action.payload;
        return dotprop.delete(state, path);
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
    this.dispatch({
      type: 'unset', payload: {
        path
      }
    });
    return true;
  }

  get(path: string): any {
    const state = this.getState();
    return dotprop.get(state, path);
  }
}

export default ReduxStore;