//TODO: Implement this interface
interface IToytag {
  name: string;
  id: number;
  uid: string;
  index: number;
  type: Tagtype;
  upgrades?: {
    page23: number;
    page25: number;
  };
}
