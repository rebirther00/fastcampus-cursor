'use client';

// 규칙 설정 모달 컴포넌트
// FSTC-16: 워크플로우 규칙 관리 기능 구현

import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/atoms/dialog';
import { Button } from '@/components/atoms/button';
import { RuleToggleSwitch } from '@/components/molecules/RuleToggleSwitch';
import { 
  useDependencyRule,
  useReviewerRule,
  useRuleModal,
  useRuleStore
} from '@/store/ruleStore';
import { useRuleNotifications } from '@/hooks/useRuleNotifications';
import { Settings, RotateCcw, Save } from 'lucide-react';

/**
 * 규칙 설정 모달 컴포넌트
 * 
 * 기능:
 * - 의존성 검사 규칙 ON/OFF
 * - 필수 리뷰어 검사 규칙 ON/OFF
 * - 설정 초기화
 * - 실시간 알림 피드백
 */
export function RuleSettingsModal() {
  const { isOpen, close } = useRuleModal();
  const { resetToDefaults } = useRuleStore();
  const dependencyRule = useDependencyRule();
  const reviewerRule = useReviewerRule();
  const { notifyRuleReset, notifySettingsSaved } = useRuleNotifications();

  const handleReset = () => {
    resetToDefaults();
    notifyRuleReset();
  };

  const handleSave = () => {
    notifySettingsSaved();
    close();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && close()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            워크플로우 규칙 관리
          </DialogTitle>
          <DialogDescription>
            팀의 상황에 맞게 워크플로우 규칙을 조정할 수 있습니다. 
            변경사항은 즉시 적용되며 자동으로 저장됩니다.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* 규칙 설정 섹션 */}
          <div className="space-y-4">
            <div className="border-b pb-2">
              <h3 className="text-lg font-semibold text-foreground">
                수정 가능한 규칙
              </h3>
              <p className="text-sm text-muted-foreground">
                프로젝트 상황에 따라 일시적으로 완화하거나 강화할 수 있는 규칙들입니다.
              </p>
            </div>

            {/* 의존성 검사 규칙 */}
            <RuleToggleSwitch
              ruleType="dependency"
              enabled={dependencyRule.enabled}
              onToggle={dependencyRule.toggle}
            />

            {/* 리뷰어 검사 규칙 */}
            <RuleToggleSwitch
              ruleType="reviewer"
              enabled={reviewerRule.enabled}
              onToggle={reviewerRule.toggle}
            />
          </div>

          {/* 수정 불가 규칙 안내 */}
          <div className="space-y-3">
            <div className="border-b pb-2">
              <h3 className="text-lg font-semibold text-foreground">
                수정 불가한 규칙
              </h3>
              <p className="text-sm text-muted-foreground">
                워크플로우의 핵심 로직으로 변경할 수 없습니다.
              </p>
            </div>

            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                <span>상태 전이 규칙: 정해진 순서대로만 카드 이동 가능</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                <span>역할 기반 권한: 개발자/PO 권한에 따른 기능 제한</span>
              </div>
            </div>
          </div>

          {/* 현재 상태 요약 */}
          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="font-medium text-foreground mb-2">현재 설정 상태</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center justify-between">
                <span>의존성 검사:</span>
                <span className={`font-medium ${dependencyRule.enabled ? 'text-green-600' : 'text-yellow-600'}`}>
                  {dependencyRule.enabled ? 'ON' : 'OFF'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>리뷰어 검사:</span>
                <span className={`font-medium ${reviewerRule.enabled ? 'text-green-600' : 'text-yellow-600'}`}>
                  {reviewerRule.enabled ? 'ON' : 'OFF'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 하단 액션 버튼 */}
        <div className="flex items-center justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={handleReset}
            className="gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            기본값으로 초기화
          </Button>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={close}
            >
              취소
            </Button>
            <Button
              onClick={handleSave}
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              저장 후 닫기
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

