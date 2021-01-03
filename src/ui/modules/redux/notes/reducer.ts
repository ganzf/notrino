const initialState = {
  isLoaded: false,
  content: undefined,
}

export default function (state: any = initialState, action: any = {}) { 
  const { type, payload } = action;
  switch (type) {
    default: return state;
  }
}