import { Process } from '@/types';

export class ProcessManager {
  private processes: Map<string, Process> = new Map();
  private listeners: Set<() => void> = new Set();

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    this.listeners.forEach(listener => listener());
  }

  createProcess(name: string, appId: string, windowId?: string): string {
    const id = crypto.randomUUID();
    const process: Process = {
      id,
      name,
      appId,
      windowId,
      status: 'running',
      createdAt: new Date(),
    };

    this.processes.set(id, process);
    this.notify();
    return id;
  }

  getProcess(id: string): Process | undefined {
    return this.processes.get(id);
  }

  getProcessByWindowId(windowId: string): Process | undefined {
    return Array.from(this.processes.values()).find(p => p.windowId === windowId);
  }

  getAllProcesses(): Process[] {
    return Array.from(this.processes.values());
  }

  updateProcess(id: string, updates: Partial<Process>): void {
    const process = this.processes.get(id);
    if (!process) return;

    Object.assign(process, updates);
    this.notify();
  }

  terminateProcess(id: string): void {
    const process = this.processes.get(id);
    if (!process) return;

    process.status = 'terminated';
    this.processes.delete(id);
    this.notify();
  }

  suspendProcess(id: string): void {
    const process = this.processes.get(id);
    if (!process) return;

    process.status = 'suspended';
    this.notify();
  }

  resumeProcess(id: string): void {
    const process = this.processes.get(id);
    if (!process) return;

    process.status = 'running';
    this.notify();
  }
}

export const processManager = new ProcessManager();
