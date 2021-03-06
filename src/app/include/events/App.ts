import ARequest from "../../../common/ARequest";
import AResponse from "../../../common/AResponse";

class UICoreIsReady extends ARequest {
  name: string = "UICoreIsReady";
  payload: {
    options: any,
  } = { 
    options: {},
  }
}

class AppCoreInitStarted extends AResponse {
  name: string = "AppCoreInitStarted";
  payload: null = null;
}

class AppCoreInitStepDetails extends AResponse {
  name: string = "AppCoreInitStepDetails";
  payload: {
    stepName: string,
  } = { 
    stepName: '...'
  }
}

class AppCoreIsReady extends AResponse {
  name: string = "AppCoreIsReady";
  payload: null = null;
}

class OpenFileExplorer extends ARequest {
  name: string = "OpenFileExplorer";
  payload: null = null;
}

class FileOpenedByUser extends AResponse {
  name: string = "FileOpenedByUser";
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