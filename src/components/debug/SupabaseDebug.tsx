import React from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export const SupabaseDebug: React.FC = () => {
  const [debugInfo, setDebugInfo] = React.useState<any>({});
  const [loading, setLoading] = React.useState(false);

  const checkSupabaseConfig = async () => {
    setLoading(true);
    
    // Get current configuration
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    // Check authentication
    const { data: session } = await supabase.auth.getSession();
    
    // Test database connection
    let dbTest = null;
    try {
      const { data, error } = await supabase
        .from('clinics')
        .select('count')
        .single();
      dbTest = error ? error.message : 'Success';
    } catch (err: any) {
      dbTest = err.message;
    }
    
    setDebugInfo({
      supabaseUrl,
      supabaseKeyPrefix: supabaseKey?.substring(0, 20) + '...',
      isLocalSupabase: supabaseUrl?.includes('127.0.0.1') || supabaseUrl?.includes('localhost'),
      session: session?.session ? 'Active' : 'No session',
      databaseTest: dbTest,
      timestamp: new Date().toISOString()
    });
    
    setLoading(false);
  };

  React.useEffect(() => {
    checkSupabaseConfig();
  }, []);

  return (
    <Card className="w-full max-w-2xl mx-auto mt-8">
      <CardHeader>
        <CardTitle>Supabase Debug Info</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p><strong>URL:</strong> {debugInfo.supabaseUrl}</p>
          <p><strong>Key:</strong> {debugInfo.supabaseKeyPrefix}</p>
          <p><strong>Local Instance:</strong> {debugInfo.isLocalSupabase ? 'Yes' : 'No'}</p>
          <p><strong>Auth Session:</strong> {debugInfo.session}</p>
          <p><strong>Database Test:</strong> {debugInfo.databaseTest}</p>
          <p><strong>Checked at:</strong> {debugInfo.timestamp}</p>
        </div>
        <Button 
          onClick={checkSupabaseConfig} 
          disabled={loading}
          className="mt-4"
        >
          {loading ? 'Checking...' : 'Refresh'}
        </Button>
      </CardContent>
    </Card>
  );
};