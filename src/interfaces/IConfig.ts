interface IConfig {
  port: number;
  verbose: boolean;
  charactermap:{
    keepInMemory: boolean,
  }
  vehiclemap:{
    keepInMemory: boolean,
  }
  gadgetmap:{
    keepInMemory: boolean,
  }
  toytags:{
    keepInMemory: boolean,
    useBinary: boolean,
  }
}
