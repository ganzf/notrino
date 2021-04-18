import ARequest from "../../../common/ARequest";
import AResponse from "../../../common/AResponse";

class UICoreIsReady extends ARequest {
  name: string = UICoreIsReady.name;
  payload: {
    options: any,
  } = { 
    options: {},
  }
}

class AppCoreInitStarted extends AResponse {
  name: string = AppCoreInitStarted.name;
  payload: null = null;
}

class AppCoreInitStepDetails extends AResponse {
  name: string = AppCoreInitStepDetails.name;
  payload: {
    stepName: string,
  } = { 
    stepName: '...'
  }
}

class AppCoreIsReady extends AResponse {
  name: string = AppCoreIsReady.name;
  payload: null = null;
}

export {
  // Requests
  UICoreIsReady,

  // Responses
  AppCoreInitStarted,
  AppCoreInitStepDetails,
  AppCoreIsReady,
}