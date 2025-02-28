interface IApplicationConfiguration {
  port: number;
}

export default (): IApplicationConfiguration => ({
  port: +process.env.PORT!,
});
