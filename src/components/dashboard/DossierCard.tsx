import { Dossier, DossierStatus } from '@/types/dossier';
import { Folder, Shield, Clock, MoreVertical, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface DossierCardProps {
  dossier: Dossier;
}

export function DossierCard({ dossier }: DossierCardProps) {
  // Calculate progress based on status
  const getProgress = (status: DossierStatus) => {
    const progressMap: Record<string, number> = {
      [DossierStatus.EN_EDITION]: 10,
      [DossierStatus.QUESTIONNAIRE_SOUMIS]: 30,
      [DossierStatus.IA1_INCOHERENT]: 35,
      [DossierStatus.IA1_COHERENT]: 40,
      [DossierStatus.ARCHI_UPLOAD_EN_COURS]: 50,
      [DossierStatus.IA2_INCOHERENT]: 55,
      [DossierStatus.IA2_COHERENT]: 60,
      [DossierStatus.RISQUES_EN_COURS]: 75,
      [DossierStatus.PRET_VALIDATION]: 90,
      [DossierStatus.VALIDE]: 100,
    };
    return progressMap[status] || 0;
  };

  const progress = getProgress(dossier.status as DossierStatus);
  
  // Determine color theme based on status
  const isComplete = dossier.status === DossierStatus.VALIDE;
  const isError = dossier.status.includes('INCOHERENT');
  
  const themeColor = isComplete 
    ? 'bg-emerald-500' 
    : isError 
      ? 'bg-amber-500' 
      : 'bg-blue-600';

  const lightThemeColor = isComplete
    ? 'bg-emerald-50 dark:bg-emerald-900/20'
    : isError
      ? 'bg-amber-50 dark:bg-amber-900/20'
      : 'bg-blue-50 dark:bg-blue-900/20';

  return (
    <div className="group relative bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-1 dark:bg-slate-900 dark:border-slate-800">
      <div className="flex justify-between items-start mb-4">
        <div className={`w-12 h-12 rounded-xl ${lightThemeColor} flex items-center justify-center`}>
          {isComplete ? (
            <Shield className="w-6 h-6 text-emerald-600 dark:text-emerald-500" />
          ) : (
            <Folder className="w-6 h-6 text-blue-600 dark:text-blue-500" />
          )}
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
          <MoreVertical className="w-4 h-4" />
        </Button>
      </div>

      <Link href={`/dashboard/dossiers/${dossier.id}`} className="block">
        <h3 className="font-semibold text-slate-900 mb-1 truncate dark:text-white" title={dossier.title}>
          {dossier.title}
        </h3>
        <p className="text-xs text-slate-500 mb-4 flex items-center gap-1 dark:text-slate-400">
          <FileText className="w-3 h-3" />
          {dossier.questionnaire_template_name || 'No Template'}
        </p>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className={`font-medium ${isError ? 'text-amber-600 dark:text-amber-500' : 'text-slate-600 dark:text-slate-300'}`}>
              {dossier.status_display}
            </span>
            <span className="text-slate-400 dark:text-slate-500">{progress}%</span>
          </div>
          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden dark:bg-slate-800">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${themeColor}`} 
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 dark:border-slate-800 dark:text-slate-500">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{new Date(dossier.updated_at).toLocaleDateString()}</span>
          </div>
          {dossier.responsible_so_details ? (
            <div className="flex items-center gap-1" title={`SO: ${dossier.responsible_so_details?.email}`}>
              <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                SO
              </div>
            </div>
          ) : null}
        </div>
      </Link>
    </div>
  );
}
