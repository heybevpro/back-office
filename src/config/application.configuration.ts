interface IApplicationConfiguration {
  port: number;
  jwtSecret: string;
}

export default (): IApplicationConfiguration => ({
  port: +process.env.PORT!,
  jwtSecret: process.env.JWT_SECRET!,
});
