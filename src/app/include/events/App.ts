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

class OpenFileExplorer extends ARequest {
  name: string = OpenFileExplorer.name;
  payload: null = null;
}

class FileOpenedByUser extends AResponse {
  name: string = FileOpenedByUser.name;
  payload: {
    filepath: string,
    content: string,
    format: string,
  }

  constructor(filepath: string, content: string, format: string) { 
    super();
    this.payload = {
      filepath, content, format
    }
  }
}

export {
  // Requests
  UICoreIsReady,
  OpenFileExplorer,

  // Responses
  AppCoreInitStarted,
  AppCoreInitStepDetails,
  AppCoreIsReady,
}