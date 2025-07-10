import { Device } from '../modules/device/entity/device.entity';

export interface DeviceResponse {
  device: Device;
  user: {
    first_name: string;
    last_name: string;
    role: string;
    email: string;
  };
  access_token: string;
}
