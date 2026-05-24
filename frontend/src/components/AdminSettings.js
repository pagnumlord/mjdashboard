import React, { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  AlertTriangle, 
  HardDrive, 
  Database, 
  Cpu, 
  RefreshCw, 
  CheckCircle, 
  FolderOpen, 
  Settings,
  Activity,
  Plus,
  Trash2,
  Calendar,
  Wrench // Changed from Tool to Wrench
} from 'lucide-react';

// Color scheme from your main app
const colors = {
  primary: '#ff3d7f',       
  primaryLight: '#ff9db8',  
  primaryDark: '#9c6172',   
  secondary: '#121212',     
  secondaryLight: '#212121',
  light: '#ffffff',         
  midGray: '#868686',       
  accent: '#00dbdd',        
  successGreen: '#4ADE80',  
  warningOrange: '#dc6300', 
  errorRed: '#FF3D3D'       
};

const AdminSettings = ({ isOpen, onClose, systemStatus, onUpdateSettings }) => {
  // State for settings
  const [settings, setSettings] = useState({
    backup: {
      enabled: true,
      frequency: 'daily',
      retention: 7,
      autoBackup: true,
      backupPath: '/mnt/animation_backup',
      lastBackup: new Date().toISOString()
    },
    storage: {
      mainPath: '/mnt/animation_storage',
      maxUsage: 95,
      warnThreshold: 85,
      cleanupEnabled: true
    },
    renderCache: {
      enabled: true,
      path: '/var/cache/blender',
      maxSize: 100, // GB
      autoCleanup: true,
      clearOnRender: false
    },
    production: {
      blender: {
        enabled: true,
        path: '/usr/bin/blender',
        version: '3.6.5',
        autoStart: false
      },
      python: {
        enabled: true,
        path: '/usr/bin/python3',
        version: '3.9.2',
        venvPath: '/opt/melodic-justice/venv'
      },
      rokoko: {
        enabled: true,
        apiKey: '',
        autoConnect: false,
        deviceCount: 2
      },
      server: {
        enabled: true,
        port: 5000,
        host: '0.0.0.0',
        autoStart: true
      }
    },
    alerts: {
      enabled: true,
      emailNotifications: false,
      email: '',
      storageWarning: true,
      backupFailure: true,
      renderErrors: true
    },
    system: {
      autoRestart: false,
      restartTime: '03:00',
      powerManagement: 'balanced'
    }
  });

  const [activeTab, setActiveTab] = useState('backup');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Load settings from localStorage or API on component mount
    const savedSettings = localStorage.getItem('melodicJustice_adminSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      // Save to localStorage
      localStorage.setItem('melodicJustice_adminSettings', JSON.stringify(settings));
      
      // Call parent update function if provided
      if (onUpdateSettings) {
        await onUpdateSettings(settings);
      }
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError('Failed to save settings: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleBackupTest = async () => {
    // This would trigger a test backup
    console.log('Testing backup...');
  };

  const handleSystemCheck = async () => {
    // This would run a system diagnostic
    console.log('Running system check...');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <Settings className="h-6 w-6 text-pink-400" />
            <h2 className="text-xl font-bold text-white">Admin Settings</h2>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-all"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Status Bar */}
        {(success || error) && (
          <div className={`p-3 text-center text-white ${success ? 'bg-green-900' : 'bg-red-900'}`}>
            {success ? 'Settings saved successfully!' : error}
          </div>
        )}

        {/* Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Navigation Tabs */}
          <div className="w-64 border-r border-gray-800 p-4">
            <nav className="space-y-2">
              {[
                { id: 'backup', label: 'Backup & Recovery', icon: Database },
                { id: 'storage', label: 'Storage Management', icon: HardDrive },
                { id: 'render', label: 'Render Cache', icon: Activity },
                { id: 'production', label: 'Production Software', icon: Wrench }, // Changed from Tool to Wrench
                { id: 'alerts', label: 'Alerts & Notifications', icon: AlertTriangle },
                { id: 'system', label: 'System Configuration', icon: Cpu }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-2 p-3 rounded transition-all ${
                    activeTab === tab.id 
                      ? 'bg-purple-900 text-white' 
                      : 'text-gray-300 hover:bg-gray-800'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Settings Content */}
          <div className="flex-1 p-6 overflow-y-auto">

            {/* Backup & Recovery Tab */}
            {activeTab === 'backup' && (
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-white">Backup & Recovery Settings</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-gray-300 mb-1">Backup Path</label>
                      <input
                        type="text"
                        value={settings.backup.backupPath}
                        onChange={(e) => setSettings({
                          ...settings,
                          backup: { ...settings.backup, backupPath: e.target.value }
                        })}
                        className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-gray-300 mb-1">Backup Frequency</label>
                      <select
                        value={settings.backup.frequency}
                        onChange={(e) => setSettings({
                          ...settings,
                          backup: { ...settings.backup, frequency: e.target.value }
                        })}
                        className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
                      >
                        <option value="hourly">Hourly</option>
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-gray-300 mb-1">Retention Period (days)</label>
                      <input
                        type="number"
                        value={settings.backup.retention}
                        onChange={(e) => setSettings({
                          ...settings,
                          backup: { ...settings.backup, retention: parseInt(e.target.value) }
                        })}
                        className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="autoBackup"
                        checked={settings.backup.autoBackup}
                        onChange={(e) => setSettings({
                          ...settings,
                          backup: { ...settings.backup, autoBackup: e.target.checked }
                        })}
                        className="mr-2"
                      />
                      <label htmlFor="autoBackup" className="text-gray-300">Enable Automatic Backup</label>
                    </div>
                    
                    <div className="bg-gray-800 p-4 rounded">
                      <h4 className="text-white font-medium mb-2">Backup Status</h4>
                      <p className="text-gray-300">
                        Last backup: {new Date(settings.backup.lastBackup).toLocaleString()}
                      </p>
                      <button
                        onClick={handleBackupTest}
                        className="mt-2 px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700"
                      >
                        Run Test Backup
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Storage Management Tab */}
            {activeTab === 'storage' && (
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-white">Storage Management</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-gray-300 mb-1">Main Storage Path</label>
                      <input
                        type="text"
                        value={settings.storage.mainPath}
                        onChange={(e) => setSettings({
                          ...settings,
                          storage: { ...settings.storage, mainPath: e.target.value }
                        })}
                        className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-gray-300 mb-1">Maximum Usage (%)</label>
                      <input
                        type="number"
                        min="50"
                        max="100"
                        value={settings.storage.maxUsage}
                        onChange={(e) => setSettings({
                          ...settings,
                          storage: { ...settings.storage, maxUsage: parseInt(e.target.value) }
                        })}
                        className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-gray-300 mb-1">Warning Threshold (%)</label>
                      <input
                        type="number"
                        min="50"
                        max="95"
                        value={settings.storage.warnThreshold}
                        onChange={(e) => setSettings({
                          ...settings,
                          storage: { ...settings.storage, warnThreshold: parseInt(e.target.value) }
                        })}
                        className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="cleanupEnabled"
                        checked={settings.storage.cleanupEnabled}
                        onChange={(e) => setSettings({
                          ...settings,
                          storage: { ...settings.storage, cleanupEnabled: e.target.checked }
                        })}
                        className="mr-2"
                      />
                      <label htmlFor="cleanupEnabled" className="text-gray-300">Enable Automatic Cleanup</label>
                    </div>
                    
                    <div className="bg-gray-800 p-4 rounded">
                      <h4 className="text-white font-medium mb-2">Current Storage</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-gray-300">
                          <span>Total:</span>
                          <span>{systemStatus?.storage?.total ? (systemStatus.storage.total / 1e12).toFixed(2) + ' TB' : 'Unknown'}</span>
                        </div>
                        <div className="flex justify-between text-gray-300">
                          <span>Used:</span>
                          <span>{systemStatus?.storage?.used ? (systemStatus.storage.used / 1e12).toFixed(2) + ' TB' : 'Unknown'}</span>
                        </div>
                        <div className="w-full bg-gray-700 h-2 rounded-full">
                          <div 
                            className="h-full rounded-full"
                            style={{ 
                              width: `${systemStatus?.storage?.percentage || 0}%`,
                              backgroundColor: systemStatus?.storage?.percentage > 85 ? colors.errorRed : colors.accent
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Render Cache Tab */}
            {activeTab === 'render' && (
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-white">Render Cache Settings</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-gray-300 mb-1">Cache Path</label>
                      <input
                        type="text"
                        value={settings.renderCache.path}
                        onChange={(e) => setSettings({
                          ...settings,
                          renderCache: { ...settings.renderCache, path: e.target.value }
                        })}
                        className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-gray-300 mb-1">Maximum Cache Size (GB)</label>
                      <input
                        type="number"
                        value={settings.renderCache.maxSize}
                        onChange={(e) => setSettings({
                          ...settings,
                          renderCache: { ...settings.renderCache, maxSize: parseInt(e.target.value) }
                        })}
                        className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="autoCleanup"
                        checked={settings.renderCache.autoCleanup}
                        onChange={(e) => setSettings({
                          ...settings,
                          renderCache: { ...settings.renderCache, autoCleanup: e.target.checked }
                        })}
                        className="mr-2"
                      />
                      <label htmlFor="autoCleanup" className="text-gray-300">Enable Auto Cleanup</label>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="clearOnRender"
                        checked={settings.renderCache.clearOnRender}
                        onChange={(e) => setSettings({
                          ...settings,
                          renderCache: { ...settings.renderCache, clearOnRender: e.target.checked }
                        })}
                        className="mr-2"
                      />
                      <label htmlFor="clearOnRender" className="text-gray-300">Clear Cache on Major Renders</label>
                    </div>
                    
                    <button
                      className="mt-4 px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
                    >
                      Clear Cache Now
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Production Software Tab */}
            {activeTab === 'production' && (
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-white">Production Software Settings</h3>
                
                {Object.entries(settings.production).map(([software, config]) => (
                  <div key={software} className="bg-gray-800 p-4 rounded">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-white font-medium capitalize">{software}</h4>
                      <div className="flex items-center gap-2">
                        <div 
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: config.enabled ? colors.successGreen : colors.errorRed }}
                        ></div>
                        <span className="text-gray-300">{config.enabled ? 'Enabled' : 'Disabled'}</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-300 mb-1">{software === 'blender' ? 'Blender Path' : `${software} Path`}</label>
                        <input
                          type="text"
                          value={config.path}
                          onChange={(e) => setSettings({
                            ...settings,
                            production: {
                              ...settings.production,
                              [software]: { ...config, path: e.target.value }
                            }
                          })}
                          className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-gray-300 mb-1">Version</label>
                        <input
                          type="text"
                          value={config.version || ''}
                          onChange={(e) => setSettings({
                            ...settings,
                            production: {
                              ...settings.production,
                              [software]: { ...config, version: e.target.value }
                            }
                          })}
                          className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white"
                        />
                      </div>
                      
                      {config.apiKey !== undefined && (
                        <div className="md:col-span-2">
                          <label className="block text-gray-300 mb-1">API Key</label>
                          <input
                            type="password"
                            value={config.apiKey}
                            onChange={(e) => setSettings({
                              ...settings,
                              production: {
                                ...settings.production,
                                [software]: { ...config, apiKey: e.target.value }
                              }
                            })}
                            className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white"
                            placeholder="Enter API key..."
                          />
                        </div>
                      )}
                      
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id={`${software}-enabled`}
                          checked={config.enabled}
                          onChange={(e) => setSettings({
                            ...settings,
                            production: {
                              ...settings.production,
                              [software]: { ...config, enabled: e.target.checked }
                            }
                          })}
                          className="mr-2"
                        />
                        <label htmlFor={`${software}-enabled`} className="text-gray-300">Enable {software}</label>
                      </div>
                      
                      {config.autoStart !== undefined && (
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id={`${software}-autostart`}
                            checked={config.autoStart}
                            onChange={(e) => setSettings({
                              ...settings,
                              production: {
                                ...settings.production,
                                [software]: { ...config, autoStart: e.target.checked }
                              }
                            })}
                            className="mr-2"
                          />
                          <label htmlFor={`${software}-autostart`} className="text-gray-300">Auto-start on boot</label>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Alerts & Notifications Tab */}
            {activeTab === 'alerts' && (
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-white">Alerts & Notifications</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="alertsEnabled"
                        checked={settings.alerts.enabled}
                        onChange={(e) => setSettings({
                          ...settings,
                          alerts: { ...settings.alerts, enabled: e.target.checked }
                        })}
                        className="mr-2"
                      />
                      <label htmlFor="alertsEnabled" className="text-gray-300">Enable Alerts</label>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="emailNotifications"
                        checked={settings.alerts.emailNotifications}
                        onChange={(e) => setSettings({
                          ...settings,
                          alerts: { ...settings.alerts, emailNotifications: e.target.checked }
                        })}
                        className="mr-2"
                      />
                      <label htmlFor="emailNotifications" className="text-gray-300">Enable Email Notifications</label>
                    </div>
                    
                    {settings.alerts.emailNotifications && (
                      <div>
                        <label className="block text-gray-300 mb-1">Notification Email</label>
                        <input
                          type="email"
                          value={settings.alerts.email}
                          onChange={(e) => setSettings({
                            ...settings,
                            alerts: { ...settings.alerts, email: e.target.value }
                          })}
                          className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
                          placeholder="your.email@example.com"
                        />
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="text-white font-medium">Alert Types</h4>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="storageWarning"
                        checked={settings.alerts.storageWarning}
                        onChange={(e) => setSettings({
                          ...settings,
                          alerts: { ...settings.alerts, storageWarning: e.target.checked }
                        })}
                        className="mr-2"
                      />
                      <label htmlFor="storageWarning" className="text-gray-300">Storage Space Warnings</label>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="backupFailure"
                        checked={settings.alerts.backupFailure}
                        onChange={(e) => setSettings({
                          ...settings,
                          alerts: { ...settings.alerts, backupFailure: e.target.checked }
                        })}
                        className="mr-2"
                      />
                      <label htmlFor="backupFailure" className="text-gray-300">Backup Failures</label>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="renderErrors"
                        checked={settings.alerts.renderErrors}
                        onChange={(e) => setSettings({
                          ...settings,
                          alerts: { ...settings.alerts, renderErrors: e.target.checked }
                        })}
                        className="mr-2"
                      />
                      <label htmlFor="renderErrors" className="text-gray-300">Render Errors</label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* System Configuration Tab */}
            {activeTab === 'system' && (
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-white">System Configuration</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="autoRestart"
                        checked={settings.system.autoRestart}
                        onChange={(e) => setSettings({
                          ...settings,
                          system: { ...settings.system, autoRestart: e.target.checked }
                        })}
                        className="mr-2"
                      />
                      <label htmlFor="autoRestart" className="text-gray-300">Enable Auto-Restart</label>
                    </div>
                    
                    {settings.system.autoRestart && (
                      <div>
                        <label className="block text-gray-300 mb-1">Restart Time</label>
                        <input
                          type="time"
                          value={settings.system.restartTime}
                          onChange={(e) => setSettings({
                            ...settings,
                            system: { ...settings.system, restartTime: e.target.value }
                          })}
                          className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
                        />
                      </div>
                    )}
                    
                    <div>
                      <label className="block text-gray-300 mb-1">Power Management</label>
                      <select
                        value={settings.system.powerManagement}
                        onChange={(e) => setSettings({
                          ...settings,
                          system: { ...settings.system, powerManagement: e.target.value }
                        })}
                        className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
                      >
                        <option value="performance">Performance</option>
                        <option value="balanced">Balanced</option>
                        <option value="power-save">Power Save</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <button
                      onClick={handleSystemCheck}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center justify-center gap-2"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Run System Check
                    </button>
                    
                    <div className="bg-gray-800 p-4 rounded">
                      <h4 className="text-white font-medium mb-2">System Info</h4>
                      <div className="space-y-1 text-gray-300">
                        <p>Raspberry Pi Model: 4B</p>
                        <p>OS: Raspbian GNU/Linux 11</p>
                        <p>Kernel: 6.1.21-v8+</p>
                        <p>Uptime: {systemStatus?.uptime ? Math.floor(systemStatus.uptime / 86400) + ' days' : 'Unknown'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-4 border-t border-gray-800 gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 rounded border border-gray-700 text-gray-300 hover:bg-gray-800"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 rounded text-white flex items-center gap-2"
            style={{ backgroundColor: colors.accent }}
          >
            {saving ? (
  <>
    <RefreshCw className="h-4 w-4 animate-spin" />
    Saving...
  </>
) : (
  <>
    <Save className="h-4 w-4" />
    Save Settings
  </>
)}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;