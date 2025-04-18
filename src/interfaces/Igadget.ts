interface IGadget {
  name: string;
  id: number;
  uid: string;
  index: number;
  upgrades?: {
    page23: number;
    page25: number;
  };
}
