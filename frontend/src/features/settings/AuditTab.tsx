import React, { useState, useEffect } from 'react';
import { ShieldAlert, User, Activity } from 'lucide-react';
import api from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';

export const AuditTab = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const { data } = await api.get('/activities');
        setLogs(data);
      } catch (error) {
        console.error('Error fetching logs', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLogs();
  }, []);

  return (
    <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
      <header>
        <h2 className="text-2xl font-black text-text-main tracking-tight flex items-center gap-3">
          <ShieldAlert className="w-6 h-6 text-orange-500" />
          Registro de Auditoría
        </h2>
        <p className="text-xs text-text-muted font-bold uppercase tracking-widest mt-1 opacity-60">Historial de Operaciones Estrictas</p>
      </header>

      <Card padding="md" className="min-h-[400px]">
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <div className="w-8 h-8 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-3">
            {logs.length === 0 && <p className="text-text-muted text-sm text-center py-10">No hay registros de actividad auditada.</p>}
            
            {logs.map((log) => (
              <div key={log.id} className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-bg-surface p-4 rounded-xl border border-border-main">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-bg-main border border-border-main flex items-center justify-center text-text-muted">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-text-main">{log.user?.name || 'Sistema'}</h4>
                    <p className="text-[10px] uppercase font-bold text-text-muted tracking-widest">{log.user?.email || 'N/A'}</p>
                  </div>
                </div>
                
                <div className="flex-1 text-center font-bold text-sm text-text-main">
                  <span className="opacity-70 mr-2">Acción:</span>
                  <Badge variant="orange" size="sm">{log.action}</Badge>
                  <span className="opacity-70 mx-2">en</span>
                  <Badge variant="slate" size="sm">{log.entityType}</Badge>
                </div>

                <div className="text-right">
                  <p className="text-xs font-bold text-text-muted">
                    {new Date(log.createdAt).toLocaleDateString('es-ES')}
                  </p>
                  <p className="text-[10px] text-text-muted opacity-60 uppercase tracking-widest">
                    {new Date(log.createdAt).toLocaleTimeString('es-ES')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};
