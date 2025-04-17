interface IApplicationConfiguration {
  port: number;
  jwtSecret: string;
  emailClientConfiguration: IEmailClientConfiguration;
}

interface ICloudProviderCredentials {
  accessKeyId: string;
  secretAccessKey: string;
}

export interface IEmailClientConfiguration {
  region: string;
  credentials: ICloudProviderCredentials;
}

export default (): IApplicationConfiguration => ({
  port: +process.env.PORT!,
  jwtSecret: process.env.JWT_SECRET!,
  emailClientConfiguration: {
    region: process.env.AWS_REGION!,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  },
});
