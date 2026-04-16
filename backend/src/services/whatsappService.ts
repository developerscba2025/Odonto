import { Client, LocalAuth } from 'whatsapp-web.js';
import qrcode from 'qrcode';

type WAStatus = 'DISCONNECTED' | 'QR_READY' | 'CONNECTED' | 'LOADING';

class WhatsAppService {
  private client: Client;
  public status: WAStatus = 'DISCONNECTED';
  public qrDataUrl: string | null = null;

  constructor() {
    this.client = new Client({
      authStrategy: new LocalAuth({ dataPath: './.wwebjs_auth' }),
      puppeteer: {
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu'
        ]
      }
    });

    this.client.on('qr', async (qr) => {
      console.log('[WhatsApp] QR recibido — escanear desde la configuración del sistema');
      this.status = 'QR_READY';
      try {
        this.qrDataUrl = await qrcode.toDataURL(qr);
      } catch (err) {
        console.error('[WhatsApp] Error generando QR imagen:', err);
      }
    });

    this.client.on('loading_screen', (percent) => {
      this.status = 'LOADING';
      console.log(`[WhatsApp] Cargando... ${percent}%`);
    });

    this.client.on('authenticated', () => {
      console.log('[WhatsApp] ✅ Autenticado correctamente');
      this.qrDataUrl = null;
    });

    this.client.on('ready', () => {
      this.status = 'CONNECTED';
      this.qrDataUrl = null;
      console.log('[WhatsApp] ✅ Cliente listo. El servicio de mensajería está activo.');
    });

    this.client.on('auth_failure', (msg) => {
      this.status = 'DISCONNECTED';
      console.error('[WhatsApp] ❌ Fallo de autenticación:', msg);
    });

    this.client.on('disconnected', (reason) => {
      this.status = 'DISCONNECTED';
      this.qrDataUrl = null;
      console.log('[WhatsApp] Desconectado:', reason);
      // Reintentar inicialización después de desconexión
      setTimeout(() => this.init(), 5000);
    });
  }

  async init() {
    try {
      this.status = 'LOADING';
      console.log('[WhatsApp] Inicializando cliente...');
      await this.client.initialize();
    } catch (err) {
      this.status = 'DISCONNECTED';
      console.error('[WhatsApp] Error al inicializar:', err);
    }
  }

  async logout() {
    try {
      await this.client.logout();
      this.status = 'DISCONNECTED';
      this.qrDataUrl = null;
      console.log('[WhatsApp] Sesión cerrada');
    } catch (err) {
      console.error('[WhatsApp] Error al cerrar sesión:', err);
    }
  }

  /**
   * Normaliza números argentinos: acepta formatos como
   * "3512345678", "+5493512345678", "0351 234-5678", etc.
   * y devuelve el JID de WhatsApp (549XXXXXXXXXX@c.us)
   */
  private normalizePhone(phone: string): string {
    let digits = phone.replace(/\D/g, '');

    // Si ya tiene el prefijo internacional completo de Argentina
    if (digits.startsWith('549') && digits.length >= 12) {
      return `${digits}@c.us`;
    }
    // Si empieza con 54 (sin el 9 móvil)
    if (digits.startsWith('54') && !digits.startsWith('549')) {
      return `549${digits.slice(2)}@c.us`;
    }
    // Si tiene prefijo 0 local (ej: 03513456789)
    if (digits.startsWith('0')) {
      digits = digits.slice(1);
    }
    // Asumir Argentina +54 9
    return `549${digits}@c.us`;
  }

  async sendMessage(phone: string, message: string): Promise<boolean> {
    if (this.status !== 'CONNECTED') {
      console.log(`[WhatsApp] No conectado — mensaje no enviado a ${phone}`);
      return false;
    }
    try {
      const jid = this.normalizePhone(phone);
      await this.client.sendMessage(jid, message);
      console.log(`[WhatsApp] ✅ Mensaje enviado a ${phone}`);
      return true;
    } catch (err) {
      console.error(`[WhatsApp] ❌ Error enviando mensaje a ${phone}:`, err);
      return false;
    }
  }

  getStatus() {
    return {
      status: this.status,
      qrDataUrl: this.qrDataUrl,
      isConnected: this.status === 'CONNECTED'
    };
  }
}

export const whatsappService = new WhatsAppService();
