'use client';

import { useCurrentUserRole } from '@/store/uiStore';
import { UserRole } from '@/types/workflow';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/atoms/select';
import { User, Crown } from 'lucide-react';

/**
 * 사용자 역할 전환 컴포넌트
 * 
 * FSTC-12: 기본 UI 컴포넌트 구현 및 데이터 연동
 * - 개발자/PO 역할 선택
 * - Zustand store와 연동
 * - 선택된 역할에 따른 UI 변경
 */
export function UserRoleSwitcher() {
  const { role, setRole } = useCurrentUserRole();

  const handleRoleChange = (newRole: string) => {
    setRole(newRole as UserRole);
  };

  const roleConfig = {
    developer: {
      label: '개발자',
      icon: <User className="h-4 w-4" />,
      description: '티켓 개발 및 QA 요청'
    },
    product_owner: {
      label: '프로덕트 오너',
      icon: <Crown className="h-4 w-4" />,
      description: '배포 승인 및 전체 관리'
    }
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground hidden sm:inline">
        역할:
      </span>
      <Select value={role} onValueChange={handleRoleChange}>
        <SelectTrigger className="w-[140px]">
          <SelectValue>
            <div className="flex items-center gap-2">
              {roleConfig[role].icon}
              <span className="hidden sm:inline">
                {roleConfig[role].label}
              </span>
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {Object.entries(roleConfig).map(([roleKey, config]) => (
            <SelectItem key={roleKey} value={roleKey}>
              <div className="flex items-center gap-2">
                {config.icon}
                <div>
                  <div className="font-medium">{config.label}</div>
                  <div className="text-xs text-muted-foreground">
                    {config.description}
                  </div>
                </div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
