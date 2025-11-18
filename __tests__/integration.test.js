const { startMonitoring } = require('../src/monitor');
const ping = require('ping');
const axios = require('axios');

jest.mock('ping');
jest.mock('axios');

describe('Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('startMonitoring', () => {
    it('deve executar monitoramento para múltiplos targets', async () => {
      const onResult = jest.fn();
      
      ping.promise.probe.mockResolvedValue({
        time: 25,
        packetLoss: 0
      });

      axios.get.mockResolvedValue({
        status: 200
      });

      startMonitoring({
        targets: ['google.com', 'youtube.com'],
        intervalSec: 60,
        onResult
      });

      // Aguardar execução inicial
      await new Promise(resolve => setImmediate(resolve));

      // Deve ter executado ping e http para cada target
      expect(onResult).toHaveBeenCalledTimes(4); // 2 targets * 2 checks
      
      // Verificar chamadas de ping
      expect(ping.promise.probe).toHaveBeenCalledWith('google.com', { timeout: 10 });
      expect(ping.promise.probe).toHaveBeenCalledWith('youtube.com', { timeout: 10 });
      
      // Verificar chamadas HTTP
      expect(axios.get).toHaveBeenCalledWith('https://google.com', expect.any(Object));
      expect(axios.get).toHaveBeenCalledWith('https://youtube.com', expect.any(Object));
    });

    it('deve executar monitoramento em intervalo configurado', async () => {
      const onResult = jest.fn();
      
      ping.promise.probe.mockResolvedValue({ time: 25, packetLoss: 0 });
      axios.get.mockResolvedValue({ status: 200 });

      const intervalId = startMonitoring({
        targets: ['example.com'],
        intervalSec: 30,
        onResult
      });

      // Execução inicial
      await new Promise(resolve => setImmediate(resolve));
      expect(onResult).toHaveBeenCalledTimes(2);

      // Avançar tempo
      jest.advanceTimersByTime(30000);
      await new Promise(resolve => setImmediate(resolve));
      
      // Deve ter executado novamente
      expect(onResult).toHaveBeenCalledTimes(4);

      clearInterval(intervalId);
    });

    it('deve continuar monitoramento mesmo com erros', async () => {
      const onResult = jest.fn();
      
      ping.promise.probe
        .mockRejectedValueOnce(new Error('Ping failed'))
        .mockResolvedValue({ time: 25, packetLoss: 0 });

      axios.get
        .mockRejectedValueOnce(new Error('HTTP failed'))
        .mockResolvedValue({ status: 200 });

      startMonitoring({
        targets: ['example.com'],
        intervalSec: 60,
        onResult
      });

      await new Promise(resolve => setImmediate(resolve));

      // Deve ter chamado onResult mesmo com erros
      expect(onResult).toHaveBeenCalledTimes(2);
      
      // Verificar que erros foram capturados
      expect(onResult).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'ping',
          error: expect.stringContaining('Ping failed')
        })
      );
      
      expect(onResult).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'http',
          error: expect.stringContaining('HTTP failed')
        })
      );
    });

    it('deve retornar intervalId para cancelamento', () => {
      const intervalId = startMonitoring({
        targets: ['example.com'],
        intervalSec: 60,
        onResult: jest.fn()
      });

      expect(intervalId).toBeDefined();
      expect(typeof intervalId).toBe('object'); // setInterval retorna um objeto no Node.js
      
      clearInterval(intervalId);
    });
  });
});
