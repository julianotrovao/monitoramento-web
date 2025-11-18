const db = require('../src/db');
const { Pool } = require('pg');

jest.mock('pg', () => {
  const mockQuery = jest.fn();
  const mockPool = jest.fn(() => ({
    query: mockQuery
  }));
  return { Pool: mockPool, mockQuery };
});

describe('Database Module', () => {
  let mockQuery;

  beforeEach(() => {
    jest.clearAllMocks();
    const { Pool } = require('pg');
    mockQuery = Pool().query;
  });

  describe('init', () => {
    it('deve criar tabela se não existir', async () => {
      mockQuery.mockResolvedValue({});

      await db.init();

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('CREATE TABLE IF NOT EXISTS monitor_results')
      );
    });
  });

  describe('insertResult', () => {
    it('deve inserir resultado de ping', async () => {
      mockQuery.mockResolvedValue({});

      const pingResult = {
        target: 'google.com',
        type: 'ping',
        rtt: 25.5,
        packetLoss: 0
      };

      await db.insertResult(pingResult);

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO monitor_results'),
        ['google.com', 'ping', 25.5, 0, null, null, null]
      );
    });

    it('deve inserir resultado HTTP', async () => {
      mockQuery.mockResolvedValue({});

      const httpResult = {
        target: 'example.com',
        type: 'http',
        time: 150,
        status: 200
      };

      await db.insertResult(httpResult);

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO monitor_results'),
        ['example.com', 'http', null, null, 150, 200, null]
      );
    });

    it('deve inserir resultado com erro', async () => {
      mockQuery.mockResolvedValue({});

      const errorResult = {
        target: 'invalid.host',
        type: 'ping',
        error: 'Network unreachable'
      };

      await db.insertResult(errorResult);

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO monitor_results'),
        ['invalid.host', 'ping', null, null, null, null, 'Network unreachable']
      );
    });
  });

  describe('query', () => {
    it('deve executar query customizada', async () => {
      mockQuery.mockResolvedValue({ rows: [{ count: 5 }] });

      const result = await db.query('SELECT COUNT(*) FROM monitor_results', []);

      expect(mockQuery).toHaveBeenCalledWith('SELECT COUNT(*) FROM monitor_results', []);
      expect(result.rows).toEqual([{ count: 5 }]);
    });
  });
});
