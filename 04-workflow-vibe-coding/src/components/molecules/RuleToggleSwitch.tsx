'use client';

// 규칙 토글 스위치 컴포넌트
// FSTC-16: 워크플로우 규칙 관리 기능 구현

import { Switch } from '@/components/atoms/switch';
import { RuleType, RULE_METADATA } from '@/types/rules';
import { Link, Users } from 'lucide-react';

interface RuleToggleSwitchProps {
  ruleType: RuleType;
  enabled: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

/**
 * 규칙 토글 스위치 컴포넌트
 * 
 * 기능:
 * - 규칙 활성화/비활성화 스위치
 * - 규칙별 아이콘 및 설명 표시
 * - 상태에 따른 시각적 피드백
 */
export function RuleToggleSwitch({ 
  ruleType, 
  enabled, 
  onToggle, 
  disabled = false 
}: RuleToggleSwitchProps) {
  const ruleMetadata = RULE_METADATA[ruleType];
  
  // 규칙별 아이콘 매핑
  const IconComponent = ruleType === 'dependency' ? Link : Users;
  
  return (
    <div className="flex items-start space-x-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
      {/* 규칙 아이콘 */}
      <div className={`p-2 rounded-md ${enabled 
        ? 'bg-primary/10 text-primary' 
        : 'bg-muted text-muted-foreground'
      }`}>
        <IconComponent className="h-5 w-5" />
      </div>
      
      {/* 규칙 정보 */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-foreground">
              {ruleMetadata.name}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {ruleMetadata.description}
            </p>
          </div>
          
          {/* 토글 스위치 */}
          <Switch
            checked={enabled}
            onCheckedChange={onToggle}
            disabled={disabled}
            aria-label={`${ruleMetadata.name} 토글`}
          />
        </div>
        
        {/* 현재 상태 설명 */}
        <div className={`mt-3 p-3 rounded-md text-sm ${enabled 
          ? 'bg-green-50 text-green-800 border border-green-200' 
          : 'bg-yellow-50 text-yellow-800 border border-yellow-200'
        }`}>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${enabled ? 'bg-green-500' : 'bg-yellow-500'}`} />
            <span className="font-medium">
              {enabled ? '활성화됨' : '비활성화됨'}
            </span>
          </div>
          <p className="mt-1 text-xs">
            {enabled ? ruleMetadata.enabledDescription : ruleMetadata.disabledDescription}
          </p>
        </div>
      </div>
    </div>
  );
}

