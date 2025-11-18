const { runPing, runHttp } = require('../src/monitor');
const ping = require('ping');
const axios = require('axios');

jest.mock('ping');
jest.mock('axios');

describe('Monitor Module', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('runPing', () => {
    it('deve retornar resultado de ping bem-sucedido', async () => {
      ping.promise.probe.mockResolvedValue({
        time: 25.5,
        packetLoss: 0
      });

      const result = await runPing('google.com');

      expect(result).toMatchObject({
        type: 'ping',
        target: 'google.com',
        rtt: 25.5,
        packetLoss: 0
      });
      expect(result.timestamp).toBeInstanceOf(Date);
      expect(ping.promise.probe).toHaveBeenCalledWith('google.com', { timeout: 10 });
    });

    it('deve lidar com ping com perda de pacotes', async () => {
      ping.promise.probe.mockResolvedValue({
        time: 100,
        packetLoss: 50
      });

      const result = await runPing('example.com');

      expect(result.rtt).toBe(100);
      expect(result.packetLoss).toBe(50);
    });

    it('deve lidar com erro de ping', async () => {
      ping.promise.probe.mockRejectedValue(new Error('Network unreachable'));

      const result = await runPing('invalid.host');

      expect(result).toMatchObject({
        type: 'ping',
        target: 'invalid.host',
        rtt: null,
        packetLoss: null,
        error: 'Error: Network unreachable'
      });
    });

    it('deve lidar com tempo desconhecido', async () => {
      ping.promise.probe.mockResolvedValue({
        time: 'unknown',
        packetLoss: 100
      });

      const result = await runPing('unreachable.com');

      expect(result.rtt).toBeNull();
      expect(result.packetLoss).toBe(100);
    });
  });

  describe('runHttp', () => {
    it('deve retornar resultado HTTP bem-sucedido', async () => {
      axios.get.mockResolvedValue({
        status: 200,
        data: 'OK'
      });

      const result = await runHttp('google.com');

      expect(result).toMatchObject({
        type: 'http',
        target: 'google.com',
        status: 200
      });
      expect(result.time).toBeGreaterThanOrEqual(0);
      expect(result.timestamp).toBeInstanceOf(Date);
      expect(axios.get).toHaveBeenCalledWith(
        'https://google.com',
        { timeout: 15000, validateStatus: expect.any(Function) }
      );
    });

    it('deve aceitar URL completa', async () => {
      axios.get.mockResolvedValue({
        status: 200
      });

      await runHttp('http://example.com');

      expect(axios.get).toHaveBeenCalledWith(
        'http://example.com',
        expect.any(Object)
      );
    });

    it('deve lidar com status HTTP de erro', async () => {
      axios.get.mockResolvedValue({
        status: 404
      });

      const result = await runHttp('example.com/notfound');

      expect(result.status).toBe(404);
      expect(result.error).toBeUndefined();
    });

    it('deve lidar com erro de conexão HTTP', async () => {
      axios.get.mockRejectedValue(new Error('ECONNREFUSED'));

      const result = await runHttp('invalid.host');

      expect(result).toMatchObject({
        type: 'http',
        target: 'invalid.host',
        status: null,
        error: 'Error: ECONNREFUSED'
      });
      expect(result.time).toBeGreaterThanOrEqual(0);
    });
  });
});
