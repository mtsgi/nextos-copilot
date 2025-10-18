import { FileSystemNode } from '@/types';

const DB_NAME = 'NextOS-FileSystem';
const DB_VERSION = 1;
const STORE_NAME = 'files';

class VirtualFileSystem {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const objectStore = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          objectStore.createIndex('path', 'path', { unique: true });
          objectStore.createIndex('parentId', 'parentId', { unique: false });
        }
      };
    });
  }

  private async ensureDB(): Promise<IDBDatabase> {
    if (!this.db) {
      await this.init();
    }
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    return this.db;
  }

  async createNode(node: FileSystemNode): Promise<void> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.add(node);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async readNode(id: string): Promise<FileSystemNode | null> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async readNodeByPath(path: string): Promise<FileSystemNode | null> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const index = store.index('path');
      const request = index.get(path);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async updateNode(node: FileSystemNode): Promise<void> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(node);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async deleteNode(id: string): Promise<void> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async listChildren(parentId: string): Promise<FileSystemNode[]> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const index = store.index('parentId');
      const request = index.getAll(parentId);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async createDirectory(path: string, parentId: string | null = null): Promise<FileSystemNode> {
    const id = crypto.randomUUID();
    const name = path.split('/').filter(Boolean).pop() || path;
    const node: FileSystemNode = {
      id,
      name,
      type: 'directory',
      path,
      parentId,
      size: 0,
      createdAt: new Date(),
      modifiedAt: new Date(),
    };
    await this.createNode(node);
    return node;
  }

  async createFile(path: string, content: string = '', parentId: string | null = null): Promise<FileSystemNode> {
    const id = crypto.randomUUID();
    const name = path.split('/').filter(Boolean).pop() || path;
    const node: FileSystemNode = {
      id,
      name,
      type: 'file',
      path,
      parentId,
      content,
      size: new Blob([content]).size,
      createdAt: new Date(),
      modifiedAt: new Date(),
    };
    await this.createNode(node);
    return node;
  }

  async initializeDefaultStructure(): Promise<void> {
    // Check if root exists
    const root = await this.readNodeByPath('/');
    if (root) return;

    // Create root directory
    const rootNode = await this.createDirectory('/', null);

    // Create default directories
    const homeNode = await this.createDirectory('/home', rootNode.id);
    await this.createDirectory('/home/documents', homeNode.id);
    await this.createDirectory('/home/downloads', homeNode.id);
    await this.createDirectory('/home/pictures', homeNode.id);
    
    const systemNode = await this.createDirectory('/system', rootNode.id);
    await this.createDirectory('/system/bin', systemNode.id);
    await this.createDirectory('/system/config', systemNode.id);

    // Create a welcome file
    await this.createFile(
      '/home/welcome.txt',
      'Welcome to NextOS!\n\nA web-based operating system built with Next.js and TypeScript.\n\nExplore the filesystem, open applications, and enjoy the desktop experience.',
      homeNode.id
    );
  }
}

export const vfs = new VirtualFileSystem();
