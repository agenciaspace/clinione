import React, { useEffect } from 'react';
// import { useRegisterSW } from 'virtual:pwa-register/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { X, RefreshCw } from 'lucide-react';

export const PWAUpdatePrompt = () => {
  // const {
  //   offlineReady: [offlineReady, setOfflineReady],
  //   needRefresh: [needRefresh, setNeedRefresh],
  //   updateServiceWorker,
  // } = useRegisterSW({
  //   onRegistered(r) {
  //     console.log('SW Registered: ' + r)
  //   },
  //   onRegisterError(error) {
  //     console.log('SW registration error', error)
  //   },
  // });

  const close = () => {
    // setOfflineReady(false);
    // setNeedRefresh(false);
  };

  // if (!offlineReady && !needRefresh) {
  //   return null;
  // }

  return null; // Temporariamente desabilitado

  // return (
  //   <div className="fixed bottom-4 right-4 z-50">
  //     <Card className="w-80 shadow-lg">
  //       <CardContent className="p-4">
  //         <div className="flex items-start justify-between">
  //           <div className="flex-1">
  //             {offlineReady ? (
  //               <p className="text-sm">App pronto para funcionar offline!</p>
  //             ) : (
  //               <p className="text-sm">Nova versão disponível, clique em recarregar para atualizar.</p>
  //             )}
  //           </div>
  //           <Button
  //             variant="ghost"
  //             size="sm"
  //             onClick={close}
  //             className="h-6 w-6 p-0"
  //           >
  //             <X className="h-4 w-4" />
  //           </Button>
  //         </div>
  //         {needRefresh && (
  //           <div className="mt-3 flex gap-2">
  //             <Button
  //               size="sm"
  //               onClick={() => updateServiceWorker(true)}
  //               className="flex items-center gap-1"
  //             >
  //               <RefreshCw className="h-3 w-3" />
  //               Recarregar
  //             </Button>
  //             <Button
  //               variant="outline"
  //               size="sm"
  //               onClick={close}
  //             >
  //               Depois
  //             </Button>
  //           </div>
  //         )}
  //       </CardContent>
  //     </Card>
  //   </div>
  // );
}; 