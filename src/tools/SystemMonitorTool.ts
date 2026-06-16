import { BaseTool, ToolSchema } from './BaseTool';
import os from 'os';
import child_process from 'child_process';

export class SystemMonitorTool implements BaseTool {
  name = 'monitor_vps';
  description = 'Obtém as métricas de uso de recursos do servidor VPS, incluindo CPU, memória, tempo de atividade (uptime) e armazenamento em disco.';

  getSchema(): ToolSchema {
    return {
      name: this.name,
      description: this.description,
      parameters: {
        type: "object",
        properties: {},
        required: []
      }
    };
  }

  async execute(): Promise<string> {
    try {
      // CPU Information
      const cpus = os.cpus();
      const cpuModel = cpus && cpus.length > 0 ? cpus[0]?.model || 'Unknown' : 'Unknown';
      const cores = cpus ? cpus.length : 0;
      const loadAvg = os.loadavg(); // [1m, 5m, 15m]

      // Memory Information
      const totalMem = os.totalmem();
      const freeMem = os.freemem();
      const usedMem = totalMem - freeMem;
      const totalMemGb = (totalMem / 1024 / 1024 / 1024).toFixed(2);
      const usedMemGb = (usedMem / 1024 / 1024 / 1024).toFixed(2);
      const memPercent = ((usedMem / totalMem) * 100).toFixed(2);

      // System Information
      const uptimeSec = os.uptime();
      const uptimeDays = Math.floor(uptimeSec / (3600 * 24));
      const platform = os.platform();
      const release = os.release();

      // Disk Information (Linux/Mac specific)
      let diskInfo = 'Não disponível';
      try {
        if (platform === 'linux' || platform === 'darwin') {
          diskInfo = child_process.execSync('df -h /').toString().trim();
        }
      } catch (e) {
        diskInfo = 'Erro ao obter informações de disco.';
      }

      return JSON.stringify({
        cpu: {
          model: cpuModel,
          cores: cores,
          loadAverage_1m_5m_15m: loadAvg,
        },
        memory: {
          total_GB: totalMemGb,
          used_GB: usedMemGb,
          usage_percent: memPercent
        },
        system: {
          platform: platform,
          release: release,
          uptime_days: uptimeDays
        },
        disk: diskInfo
      }, null, 2);
    } catch (error: any) {
      console.error('[SystemMonitorTool] Error:', error);
      return JSON.stringify({ error: 'Failed to retrieve system metrics', details: error.message });
    }
  }
}
