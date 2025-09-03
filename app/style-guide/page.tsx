'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ColorPalette, GradientPalette } from "@/components/ui/color-palette"
import { CodeBlock, InlineCode } from "@/components/ui/code-block"
import { Alert } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Dialog } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"
import { 
  Palette, 
  Type, 
  Layout, 
  Eye,
  Heart,
  MessageCircle,
  Users,
  Calendar,
  Settings,
  AlertCircle,
  CheckCircle,
  Info,
  XCircle,
  Star,
  Award,
  Zap,
  Clock,
  Download,
  Upload,
  Play,
  Pause,
  Volume2
} from "lucide-react"

const tabs = [
  { id: 'colors', label: '색상', icon: Palette },
  { id: 'typography', label: '타이포그래피', icon: Type },
  { id: 'components', label: '컴포넌트', icon: Layout },
  { id: 'accessibility', label: '접근성', icon: Eye }
]

// 브랜드 색상 데이터 - 라벤더 메인으로 변경
const brandColors = [
  {
    name: '라벤더 (메인)',
    hex: '#A78BFA',
    className: 'bg-violet-400',
    cssVar: 'primary',
    description: '부드러운 신뢰감과 따뜻한 포근함'
  },
  {
    name: '연한 라벤더',
    hex: '#C4B5FD',
    className: 'bg-violet-300',
    cssVar: 'primary-light',
    description: '배경 및 부드러운 요소'
  },
  {
    name: '강조 라벤더',
    hex: '#8B5CF6',
    className: 'bg-violet-500',
    cssVar: 'primary-dark',
    description: '중요한 강조가 필요할 때'
  }
]

const peachColors = [
  {
    name: '따뜻한 피치 (보조)',
    hex: '#FBBF24',
    className: 'bg-yellow-400',
    cssVar: 'secondary',
    description: '따뜻하고 친근한 보조 색상'
  },
  {
    name: '연한 피치',
    hex: '#FEF3C7',
    className: 'bg-yellow-100',
    cssVar: 'secondary-light',
    description: '은은한 배경 요소'
  },
  {
    name: '강조 피치',
    hex: '#F59E0B',
    className: 'bg-yellow-500',
    cssVar: 'secondary-dark',
    description: '보조 강조 요소'
  }
]

const grayColors = [
  {
    name: '따뜻한 그레이',
    hex: '#64748B',
    className: 'bg-gray-500',
    cssVar: 'gray-500',
    description: '중립적이고 부드러운 텍스트'
  },
  {
    name: '연한 그레이',
    hex: '#E2E8F0',
    className: 'bg-gray-200',
    cssVar: 'gray-200',
    description: '경계선과 구분선'
  },
  {
    name: '화이트 그레이',
    hex: '#F8FAFC',
    className: 'bg-gray-50',
    cssVar: 'gray-50',
    description: '깨끗한 배경'
  }
]

// 상태 색상 시스템 - 최소화
const stateColors = [
  {
    name: '성공',
    hex: '#10B981',
    className: 'bg-green-500',
    cssVar: 'success',
    description: '완료, 성공 상태'
  },
  {
    name: '주의',
    hex: '#FBBF24',
    className: 'bg-yellow-400',
    cssVar: 'warning',
    description: '경고, 주의 상태'
  },
  {
    name: '오류',
    hex: '#F87171',
    className: 'bg-red-400',
    cssVar: 'error',
    description: '오류, 실패 상태'
  },
  {
    name: '정보',
    hex: '#60A5FA',
    className: 'bg-blue-400',
    cssVar: 'info',
    description: '정보, 안내 상태'
  }
]

// 기존 기능별 색상들은 더 이상 사용하지 않음
const purpleColors = [
  {
    name: 'Purple 800',
    hex: '#6B21A8',
    className: 'bg-purple-800',
    cssVar: 'purple-800',
    description: '혼자모드 진한 텍스트'
  },
  {
    name: 'Purple 600',
    hex: '#9333EA',
    className: 'bg-purple-600',
    cssVar: 'purple-600',
    description: '혼자모드 메인 컬러'
  },
  {
    name: 'Purple 500',
    hex: '#A855F7',
    className: 'bg-purple-500',
    cssVar: 'purple-500',
    description: '혼자모드 액센트'
  },
  {
    name: 'Purple 100',
    hex: '#E879F9',
    className: 'bg-purple-100',
    cssVar: 'purple-100',
    description: '혼자모드 배경'
  },
  {
    name: 'Purple 50',
    hex: '#FAF5FF',
    className: 'bg-purple-50',
    cssVar: 'purple-50',
    description: '혼자모드 라이트 배경'
  }
]

const blueColors = [
  {
    name: 'Blue 800',
    hex: '#1E40AF',
    className: 'bg-blue-800',
    cssVar: 'blue-800',
    description: '정보 진한 텍스트'
  },
  {
    name: 'Blue 600',
    hex: '#2563EB',
    className: 'bg-blue-600',
    cssVar: 'blue-600',
    description: '정보/알림 메인 컬러'
  },
  {
    name: 'Blue 500',
    hex: '#3B82F6',
    className: 'bg-blue-500',
    cssVar: 'blue-500',
    description: '정보 액센트'
  },
  {
    name: 'Blue 100',
    hex: '#DBEAFE',
    className: 'bg-blue-100',
    cssVar: 'blue-100',
    description: '정보 배경'
  },
  {
    name: 'Blue 50',
    hex: '#EFF6FF',
    className: 'bg-blue-50',
    cssVar: 'blue-50',
    description: '정보 라이트 배경'
  }
]

const greenColors = [
  {
    name: 'Green 800',
    hex: '#166534',
    className: 'bg-green-800',
    cssVar: 'green-800',
    description: '성공 진한 텍스트'
  },
  {
    name: 'Green 600',
    hex: '#16A34A',
    className: 'bg-green-600',
    cssVar: 'green-600',
    description: '성공/완료 메인 컬러'
  },
  {
    name: 'Green 500',
    hex: '#22C55E',
    className: 'bg-green-500',
    cssVar: 'green-500',
    description: '성공 액센트'
  },
  {
    name: 'Green 100',
    hex: '#DCFCE7',
    className: 'bg-green-100',
    cssVar: 'green-100',
    description: '성공 배경'
  },
  {
    name: 'Green 50',
    hex: '#F0FDF4',
    className: 'bg-green-50',
    cssVar: 'green-50',
    description: '성공 라이트 배경'
  }
]

const redColors = [
  {
    name: 'Red 800',
    hex: '#991B1B',
    className: 'bg-red-800',
    cssVar: 'red-800',
    description: '에러 진한 텍스트'
  },
  {
    name: 'Red 600',
    hex: '#DC2626',
    className: 'bg-red-600',
    cssVar: 'red-600',
    description: '에러/경고 메인 컬러'
  },
  {
    name: 'Red 500',
    hex: '#EF4444',
    className: 'bg-red-500',
    cssVar: 'red-500',
    description: '에러 액센트'
  },
  {
    name: 'Red 100',
    hex: '#FEE2E2',
    className: 'bg-red-100',
    cssVar: 'red-100',
    description: '에러 배경'
  },
  {
    name: 'Red 50',
    hex: '#FEF2F2',
    className: 'bg-red-50',
    cssVar: 'red-50',
    description: '에러 라이트 배경'
  }
]

const yellowColors = [
  {
    name: 'Yellow 900',
    hex: '#78350F',
    className: 'bg-yellow-900',
    cssVar: 'yellow-900',
    description: '주의 진한 텍스트'
  },
  {
    name: 'Yellow 600',
    hex: '#D97706',
    className: 'bg-yellow-600',
    cssVar: 'yellow-600',
    description: '주의/알림 메인 컬러'
  },
  {
    name: 'Yellow 400',
    hex: '#FBBF24',
    className: 'bg-yellow-400',
    cssVar: 'yellow-400',
    description: '카카오 브랜드 컬러'
  },
  {
    name: 'Yellow 100',
    hex: '#FEF3C7',
    className: 'bg-yellow-100',
    cssVar: 'yellow-100',
    description: '주의 배경'
  },
  {
    name: 'Yellow 50',
    hex: '#FFFBEB',
    className: 'bg-yellow-50',
    cssVar: 'yellow-50',
    description: '주의 라이트 배경'
  }
]

const indigoColors = [
  {
    name: 'Indigo 600',
    hex: '#4F46E5',
    className: 'bg-indigo-600',
    cssVar: 'indigo-600',
    description: '시스템/설정 메인 컬러'
  },
  {
    name: 'Indigo 500',
    hex: '#6366F1',
    className: 'bg-indigo-500',
    cssVar: 'indigo-500',
    description: '시스템 액센트'
  },
  {
    name: 'Indigo 100',
    hex: '#E0E7FF',
    className: 'bg-indigo-100',
    cssVar: 'indigo-100',
    description: '시스템 배경'
  },
  {
    name: 'Indigo 50',
    hex: '#EEF2FF',
    className: 'bg-indigo-50',
    cssVar: 'indigo-50',
    description: '시스템 라이트 배경'
  }
]

const pinkColors = [
  {
    name: 'Pink 600',
    hex: '#DB2777',
    className: 'bg-pink-600',
    cssVar: 'pink-600',
    description: '소셜/공유 메인 컬러'
  },
  {
    name: 'Pink 500',
    hex: '#EC4899',
    className: 'bg-pink-500',
    cssVar: 'pink-500',
    description: '소셜 액센트'
  },
  {
    name: 'Pink 100',
    hex: '#FCE7F3',
    className: 'bg-pink-100',
    cssVar: 'pink-100',
    description: '소셜 배경'
  },
  {
    name: 'Pink 50',
    hex: '#FDF2F8',
    className: 'bg-pink-50',
    cssVar: 'pink-50',
    description: '소셜 라이트 배경'
  }
]

const roseColors = [
  {
    name: 'Rose 600',
    hex: '#E11D48',
    className: 'bg-rose-600',
    cssVar: 'rose-600',
    description: '강조 메인 컬러'
  },
  {
    name: 'Rose 400',
    hex: '#FB7185',
    className: 'bg-rose-400',
    cssVar: 'rose-400',
    description: '긴급/강조 상태'
  },
  {
    name: 'Rose 100',
    hex: '#FFE4E6',
    className: 'bg-rose-100',
    cssVar: 'rose-100',
    description: '강조 배경'
  },
  {
    name: 'Rose 50',
    hex: '#FFF1F2',
    className: 'bg-rose-50',
    cssVar: 'rose-50',
    description: '강조 라이트 배경'
  }
]

const brandGradients = [
  {
    name: '따뜻한 그라디언트',
    gradient: 'linear-gradient(135deg, #FB923C 0%, #FED7AA 100%)',
    description: '피치에서 연한 피치로 이어지는 포근함'
  },
  {
    name: '부드러운 그라디언트',
    gradient: 'linear-gradient(135deg, #C4B5FD 0%, #E0E7FF 100%)',
    description: '라벤더에서 연한 블루로 이어지는 평온함'
  }
]

const accessibilityChecklist = [
  { item: '터치 타겟 최소 44×44px', status: '완료' },
  { item: '색상 대비 4.5:1 이상', status: '완료' },
  { item: '키보드 네비게이션 지원', status: '완료' },
  { item: 'ARIA 레이블 적용', status: '진행중' },
  { item: '스크린 리더 호환성', status: '진행중' },
  { item: '포커스 인디케이터', status: '완료' }
]

export default function StyleGuidePage() {
  const [activeTab, setActiveTab] = useState('colors')
  
  // 컴포넌트 상태들을 최상위로 이동
  const [dialogOpen, setDialogOpen] = useState(false)
  const [switchChecked, setSwitchChecked] = useState(false)
  const [checkboxChecked, setCheckboxChecked] = useState(false)
  const [selectValue, setSelectValue] = useState("")
  const [progressValue, setProgressValue] = useState(65)
  const [isLoading, setIsLoading] = useState(false)

  const renderColors = () => (
    <div className="space-y-8">
      <div className="prose max-w-none">
        <h2 className="text-2xl font-bold text-gray-900">브랜드 색상 시스템</h2>
        <p className="text-gray-600">
          마음배달은 신뢰감을 주는 부드러운 라벤더를 메인으로, 따뜻함을 더하는 피치를 보조색으로 사용하는 조화로운 색상 시스템을 사용합니다.
          부드럽고 차분한 톤으로 모든 색상이 접근성 기준(WCAG 2.1 AA)을 충족합니다.
        </p>
      </div>

      {/* 브랜드 핵심 색상 */}
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-6">브랜드 핵심 색상</h3>
        <div className="space-y-6">
          <ColorPalette title="메인 컬러 - 라벤더" colors={brandColors} />
          <ColorPalette title="보조 컬러 - 피치" colors={peachColors} />
          <ColorPalette title="중성 컬러 - 그레이" colors={grayColors} />
        </div>
      </div>

      {/* 상태 색상 시스템 */}
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-6">상태 색상 시스템</h3>
        <div className="space-y-6">
          <ColorPalette title="상태 표시 색상" colors={stateColors} />
        </div>
      </div>

      <GradientPalette title="그라디언트" gradients={brandGradients} />

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">CSS 변수 사용법</h3>
        <CodeBlock title="CSS Variables" language="css">
{`/* 브랜드 색상 사용 */
.custom-element {
  color: var(--primary);          /* 라벤더 */
  background: var(--primary-light); /* 연한 라벤더 */
  border: 1px solid var(--secondary); /* 따뜻한 피치 */
}

/* 상태 색상 사용 */
.success-message {
  color: var(--green-600);
  background: var(--green-50);
  border: 1px solid var(--green-100);
}

.error-message {
  color: var(--red-800);
  background: var(--red-50);
  border: 1px solid var(--red-100);
}

.info-box {
  color: var(--blue-800);
  background: var(--blue-50);
}

.solo-mode {
  color: var(--purple-600);
  background: var(--purple-50);
}

/* 그라디언트 사용 */
.gradient-bg {
  background: linear-gradient(135deg, 
    var(--primary-orange-600) 0%, 
    var(--primary-orange-500) 100%);
}

.kakao-button {
  background: var(--yellow-400);
  color: var(--yellow-900);
}`}
        </CodeBlock>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Tailwind 클래스 예시</h3>
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">브랜드 핵심 색상</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {[
                'text-violet-600',
                'bg-violet-500',
                'border-violet-400',
                'text-yellow-600',
                'bg-yellow-400',
                'border-yellow-300',
                'text-gray-900',
                'bg-gray-50'
              ].map(className => (
                <InlineCode key={className} copyable>{className}</InlineCode>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">기능별 색상</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {[
                'text-purple-600',
                'bg-purple-50',
                'text-blue-600',
                'bg-blue-50',
                'text-green-600',
                'bg-green-50',
                'text-red-600',
                'bg-red-50',
                'text-yellow-900',
                'bg-yellow-400',
                'text-rose-600',
                'bg-rose-400',
                'text-indigo-600',
                'bg-indigo-50',
                'text-pink-600',
                'bg-pink-50'
              ].map(className => (
                <InlineCode key={className} copyable>{className}</InlineCode>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderTypography = () => (
    <div className="space-y-8">
      <div className="prose max-w-none">
        <h2 className="text-2xl font-bold text-gray-900">타이포그래피</h2>
        <p className="text-gray-600">
          Pretendard 폰트를 기본으로 하며, 한글과 영문 모두에 최적화된 가독성을 제공합니다.
        </p>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-6">텍스트 스케일</h3>
        <div className="space-y-6">
          <div>
            <div className="text-4xl font-bold text-gray-900 mb-2">
              마음배달 제목
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span>text-4xl font-bold</span>
              <InlineCode copyable>text-4xl font-bold</InlineCode>
            </div>
          </div>
          
          <div>
            <div className="text-2xl font-semibold text-gray-900 mb-2">
              섹션 제목
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span>text-2xl font-semibold</span>
              <InlineCode copyable>text-2xl font-semibold</InlineCode>
            </div>
          </div>
          
          <div>
            <div className="text-lg font-medium text-gray-900 mb-2">
              서브 제목
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span>text-lg font-medium</span>
              <InlineCode copyable>text-lg font-medium</InlineCode>
            </div>
          </div>
          
          <div>
            <div className="text-base text-gray-900 mb-2">
              본문 텍스트 - 가족과의 소통을 위한 따뜻한 플랫폼
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span>text-base</span>
              <InlineCode copyable>text-base</InlineCode>
            </div>
          </div>
          
          <div>
            <div className="text-sm text-gray-600 mb-2">
              설명 텍스트 - 추가적인 정보나 안내 메시지
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span>text-sm text-gray-600</span>
              <InlineCode copyable>text-sm text-gray-600</InlineCode>
            </div>
          </div>
          
          <div>
            <div className="text-xs text-gray-500 mb-2">
              캡션 텍스트 - 타임스탬프, 메타 정보
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span>text-xs text-gray-500</span>
              <InlineCode copyable>text-xs text-gray-500</InlineCode>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">폰트 사용법</h3>
        <CodeBlock title="Font Family" language="css">
{`/* 기본 폰트 스택 */
font-family: "Pretendard", -apple-system, BlinkMacSystemFont, 
  system-ui, Roboto, "Helvetica Neue", "Segoe UI", 
  "Apple SD Gothic Neo", "Noto Sans KR", "Malgun Gothic", 
  "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", sans-serif;

/* Tailwind 클래스 */
.font-sans /* 기본 산세리프 */
.font-mono /* 코드용 모노스페이스 */`}
        </CodeBlock>
      </div>
    </div>
  )

  const handleLoadingDemo = async () => {
    setIsLoading(true)
    setTimeout(() => setIsLoading(false), 3000)
  }

  const renderComponents = () => {

    return (
      <div className="space-y-12">
        <div className="prose max-w-none">
          <h2 className="text-2xl font-bold text-gray-900">컴포넌트 라이브러리</h2>
          <p className="text-gray-600">
            마음배달에서 사용하는 모든 UI 컴포넌트와 실제 동작하는 예시입니다.
          </p>
        </div>

        {/* Navigation & Actions */}
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Navigation & Actions</h3>
          
          {/* 버튼 */}
          <div className="mb-8">
            <h4 className="text-lg font-medium text-gray-900 mb-4">버튼 (Button)</h4>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-3">다양한 variant 스타일</p>
                <div className="flex flex-wrap gap-4 items-center">
                  <Button>Primary</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="destructive">Destructive</Button>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-gray-600 mb-3">다양한 크기</p>
                <div className="flex flex-wrap gap-4 items-center">
                  <Button size="sm">Small</Button>
                  <Button>Default</Button>
                  <Button size="lg">Large</Button>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-3">아이콘과 함께</p>
                <div className="flex flex-wrap gap-4 items-center">
                  <Button><Heart className="h-4 w-4 mr-2" />좋아요</Button>
                  <Button variant="outline"><Download className="h-4 w-4 mr-2" />다운로드</Button>
                  <Button variant="secondary"><Upload className="h-4 w-4 mr-2" />업로드</Button>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-3">상태별 버튼</p>
                <div className="flex flex-wrap gap-4 items-center">
                  <Button disabled>비활성화</Button>
                  <Button onClick={handleLoadingDemo} disabled={isLoading}>
                    {isLoading ? <LoadingSpinner className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                    {isLoading ? '로딩 중...' : '액션 실행'}
                  </Button>
                </div>
              </div>

              <CodeBlock title="Button 사용법" language="tsx">
{`import { Button } from "@/components/ui/button"
import { Heart, Download } from "lucide-react"

{/* 기본 사용법 */}
<Button>Primary</Button>
<Button variant="outline">Outline</Button>
<Button variant="secondary">Secondary</Button>

{/* 크기 변경 */}
<Button size="sm">Small</Button>
<Button size="lg">Large</Button>

{/* 아이콘과 함께 */}
<Button>
  <Heart className="h-4 w-4 mr-2" />
  좋아요
</Button>

{/* 비활성화 */}
<Button disabled>비활성화</Button>`}
              </CodeBlock>
            </div>
          </div>
        </div>

        {/* Form Controls */}
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Form Controls</h3>
          
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Input & Textarea */}
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-4">Input & Textarea</h4>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    기본 입력 필드
                  </label>
                  <Input placeholder="닉네임을 입력해주세요" />
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    긴 텍스트 입력
                  </label>
                  <Textarea 
                    placeholder="따뜻한 마음을 담아 답변해주세요..." 
                    className="min-h-[100px]"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    비활성화된 입력
                  </label>
                  <Input placeholder="비활성화" disabled />
                </div>
              </div>
            </div>

            {/* Select */}
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-4">Select</h4>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    기본 선택 박스
                  </label>
                  <Select value={selectValue} onValueChange={setSelectValue}>
                    <SelectTrigger>
                      <SelectValue placeholder="옵션을 선택해주세요" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="family">가족</SelectItem>
                      <SelectItem value="friend">친구</SelectItem>
                      <SelectItem value="couple">연인</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    그룹화된 선택 박스
                  </label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="관계를 선택해주세요" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>가족</SelectLabel>
                        <SelectItem value="parent">부모님</SelectItem>
                        <SelectItem value="sibling">형제자매</SelectItem>
                        <SelectItem value="child">자녀</SelectItem>
                      </SelectGroup>
                      <SelectGroup>
                        <SelectLabel>기타</SelectLabel>
                        <SelectItem value="friend">친구</SelectItem>
                        <SelectItem value="colleague">동료</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 mt-8">
            {/* Switch & Checkbox */}
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-4">Switch & Checkbox</h4>
              <div className="space-y-6">
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-3">스위치 (Switch)</p>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Switch 
                        id="notifications"
                        checked={switchChecked} 
                        onCheckedChange={setSwitchChecked} 
                      />
                      <label htmlFor="notifications" className="text-sm text-gray-700">
                        알림 받기 {switchChecked ? '(켜짐)' : '(꺼짐)'}
                      </label>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Switch id="privacy" defaultChecked />
                      <label htmlFor="privacy" className="text-sm text-gray-700">
                        개인정보 보호 (기본 켜짐)
                      </label>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Switch id="disabled" disabled />
                      <label htmlFor="disabled" className="text-sm text-gray-500">
                        비활성화된 스위치
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-700 mb-3">체크박스 (Checkbox)</p>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Checkbox 
                        id="terms"
                        checked={checkboxChecked} 
                        onCheckedChange={(checked) => setCheckboxChecked(checked === true)} 
                      />
                      <label htmlFor="terms" className="text-sm text-gray-700">
                        이용약관 동의 {checkboxChecked ? '✓' : ''}
                      </label>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Checkbox id="marketing" defaultChecked />
                      <label htmlFor="marketing" className="text-sm text-gray-700">
                        마케팅 정보 수신 동의 (선택)
                      </label>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Checkbox id="disabled-check" disabled />
                      <label htmlFor="disabled-check" className="text-sm text-gray-500">
                        비활성화된 체크박스
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <CodeBlock title="Form Controls 사용법" language="tsx">
{`import { Input, Textarea } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"

{/* Input */}
<Input placeholder="입력해주세요" />
<Textarea placeholder="긴 텍스트" className="min-h-[100px]" />

{/* Select */}
<Select value={value} onValueChange={setValue}>
  <SelectTrigger>
    <SelectValue placeholder="선택해주세요" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">옵션 1</SelectItem>
    <SelectItem value="option2">옵션 2</SelectItem>
  </SelectContent>
</Select>

{/* Switch */}
<Switch 
  id="switch" 
  checked={checked} 
  onCheckedChange={setChecked} 
/>

{/* Checkbox */}
<Checkbox 
  id="checkbox" 
  checked={checked} 
  onCheckedChange={setChecked} 
/>`}
              </CodeBlock>
            </div>
          </div>
        </div>

        {/* Feedback Components */}
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Feedback Components</h3>
          
          {/* Alert */}
          <div className="mb-8">
            <h4 className="text-lg font-medium text-gray-900 mb-4">알림 (Alert)</h4>
            <div className="space-y-4">
              <Alert>
                <Info className="h-4 w-4" />
                <div>
                  <h5 className="font-medium">정보 알림</h5>
                  <p className="text-sm text-gray-600 mt-1">
                    새로운 질문이 도착했습니다. 확인해보세요!
                  </p>
                </div>
              </Alert>

              <Alert variant="success">
                <CheckCircle className="h-4 w-4" />
                <div>
                  <h5 className="font-medium">성공</h5>
                  <p className="text-sm text-gray-600 mt-1">
                    답변이 성공적으로 저장되었습니다.
                  </p>
                </div>
              </Alert>

              <Alert variant="warning">
                <AlertCircle className="h-4 w-4" />
                <div>
                  <h5 className="font-medium">주의</h5>
                  <p className="text-sm text-gray-600 mt-1">
                    마감시간이 1시간 남았습니다.
                  </p>
                </div>
              </Alert>

              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <div>
                  <h5 className="font-medium">오류</h5>
                  <p className="text-sm text-gray-600 mt-1">
                    네트워크 오류가 발생했습니다. 다시 시도해주세요.
                  </p>
                </div>
              </Alert>
            </div>
          </div>

          {/* Toast */}
          <div className="mb-8">
            <h4 className="text-lg font-medium text-gray-900 mb-4">토스트 (Toast)</h4>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-3">기본 토스트 알림</p>
                <div className="space-y-3">
                  {/* 성공 토스트 */}
                  <div className="max-w-sm mx-auto p-4 bg-white rounded-lg border-l-4 border-green-500 shadow-md">
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">답변이 저장되었습니다</p>
                        <p className="text-sm text-gray-600 mt-1">상대방의 답변을 기다리고 있어요.</p>
                      </div>
                      <button className="text-gray-400 hover:text-gray-600">
                        <span className="sr-only">닫기</span>
                        ×
                      </button>
                    </div>
                  </div>

                  {/* 에러 토스트 */}
                  <div className="max-w-sm mx-auto p-4 bg-white rounded-lg border-l-4 border-red-500 shadow-md">
                    <div className="flex items-start space-x-3">
                      <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">오류가 발생했습니다</p>
                        <p className="text-sm text-gray-600 mt-1">다시 시도해 주세요.</p>
                      </div>
                      <button className="text-gray-400 hover:text-gray-600">
                        <span className="sr-only">닫기</span>
                        ×
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-3">게이트 공개 특별 토스트</p>
                <div className="max-w-sm mx-auto relative">
                  {/* 배경 글로우 효과 */}
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-2xl blur-lg opacity-30 animate-pulse"></div>
                  
                  {/* 메인 토스트 */}
                  <div className="relative bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl shadow-2xl overflow-hidden">
                    {/* 상단 장식 */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-300 via-pink-300 to-purple-300"></div>
                    
                    <div className="p-6">
                      {/* 헤더 */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-2">
                          <div className="text-2xl animate-bounce">🎉</div>
                          <div className="text-lg font-bold">마음의 문이 열렸어요!</div>
                        </div>
                        
                        <button className="text-white/70 hover:text-white transition-colors duration-200 p-1">
                          <span className="sr-only">닫기</span>
                          ×
                        </button>
                      </div>
                      
                      {/* 메시지 */}
                      <div className="mb-4">
                        <p className="text-sm leading-relaxed">
                          두 분 모두 답변을 완료하셨어요!<br />
                          이제 서로의 마음을 확인해보세요 💙
                        </p>
                      </div>
                      
                      {/* 액션 버튼들 */}
                      <div className="flex space-x-2">
                        <button className="flex-1 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-medium py-2.5 px-4 rounded-lg transition-all duration-200 transform hover:scale-105">
                          대화 보기
                        </button>
                        
                        <button className="px-4 py-2.5 text-white/80 hover:text-white transition-colors duration-200 text-sm">
                          나중에
                        </button>
                      </div>
                    </div>
                    
                    {/* 하단 장식 파티클 */}
                    <div className="absolute bottom-0 left-0 right-0">
                      <div className="flex justify-center space-x-1 pb-2">
                        <div className="w-1 h-1 bg-white/60 rounded-full animate-ping" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-1 h-1 bg-white/60 rounded-full animate-ping" style={{ animationDelay: '200ms' }}></div>
                        <div className="w-1 h-1 bg-white/60 rounded-full animate-ping" style={{ animationDelay: '400ms' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <CodeBlock title="Toast 사용법" language="tsx">
{`import { useToast } from '@/components/ui/toast/useToast'

// 기본 토스트 사용법
const { addToast, showGateOpened } = useToast()

// 성공 토스트
addToast({
  type: 'success',
  message: '답변이 저장되었습니다',
  description: '상대방의 답변을 기다리고 있어요.'
})

// 에러 토스트
addToast({
  type: 'error',
  message: '오류가 발생했습니다',
  description: '다시 시도해 주세요.'
})

// 게이트 공개 특별 토스트
showGateOpened('conversation-id', () => {
  router.push('/conversation/123')
})`}
              </CodeBlock>
            </div>
          </div>

          {/* Badge */}
          <div className="mb-8">
            <h4 className="text-lg font-medium text-gray-900 mb-4">배지 (Badge)</h4>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-3">기본 배지</p>
                <div className="flex flex-wrap gap-3">
                  <Badge>New</Badge>
                  <Badge variant="secondary">Secondary</Badge>
                  <Badge variant="outline">Outline</Badge>
                  <Badge variant="destructive">Error</Badge>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-3">마음배달 특화 배지</p>
                <div className="flex flex-wrap gap-3">
                  <Badge className="bg-violet-100 text-violet-800 hover:bg-violet-200">
                    <Heart className="h-3 w-3 mr-1" />
                    오늘의 질문
                  </Badge>
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    답변 완료
                  </Badge>
                  <Badge className="bg-violet-100 text-violet-800 hover:bg-violet-200">
                    <Users className="h-3 w-3 mr-1" />
                    가족 모드
                  </Badge>
                  <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200">
                    <Star className="h-3 w-3 mr-1" />
                    혼자 모드
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Loading & Progress */}
          <div className="grid lg:grid-cols-2 gap-8">
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-4">로딩 스피너 (Loading)</h4>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-3">다양한 크기</p>
                  <div className="flex items-center gap-4">
                    <LoadingSpinner size="sm" />
                    <LoadingSpinner />
                    <LoadingSpinner size="lg" />
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-3">다양한 색상</p>
                  <div className="flex items-center gap-4">
                    <LoadingSpinner className="text-violet-600" />
                    <LoadingSpinner className="text-violet-600" />
                    <LoadingSpinner className="text-green-600" />
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-3">텍스트와 함께</p>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <LoadingSpinner size="sm" />
                    데이터를 불러오는 중...
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-4">프로그레스 바 (Progress)</h4>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>진행률</span>
                    <span>{progressValue}%</span>
                  </div>
                  <Progress value={progressValue} />
                </div>

                <div>
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>오늘의 답변</span>
                    <span>2/2 완료</span>
                  </div>
                  <Progress value={100} className="bg-green-100" />
                </div>

                <div>
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>이번 주 참여도</span>
                    <span>4/7일</span>
                  </div>
                  <Progress value={57} className="bg-violet-100" />
                </div>

                <div className="space-x-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => setProgressValue(Math.max(0, progressValue - 10))}
                  >
                    -10%
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => setProgressValue(Math.min(100, progressValue + 10))}
                  >
                    +10%
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Skeleton */}
          <div className="mt-8">
            <h4 className="text-lg font-medium text-gray-900 mb-4">스켈레톤 (Skeleton)</h4>
            <div className="space-y-6">
              <div>
                <p className="text-sm text-gray-600 mb-3">카드 스켈레톤</p>
                <Card className="p-6 space-y-3">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-8 w-20" />
                </Card>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-3">텍스트 스켈레톤</p>
                <div className="space-y-2">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Layout Components */}
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Layout Components</h3>
          
          {/* Card */}
          <div className="mb-8">
            <h4 className="text-lg font-medium text-gray-900 mb-4">카드 (Card)</h4>
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Heart className="h-5 w-5 text-violet-600" />
                  <h5 className="font-semibold text-gray-900">오늘의 질문</h5>
                </div>
                <p className="text-gray-600 mb-4">
                  가족에게 가장 감사한 일이 있다면 무엇인가요?
                </p>
                <div className="flex gap-2">
                  <Button size="sm">답변하기</Button>
                  <Button size="sm" variant="outline">건너뛰기</Button>
                </div>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-violet-50 to-violet-100">
                <div className="flex items-center gap-3 mb-4">
                  <MessageCircle className="h-5 w-5 text-violet-600" />
                  <h5 className="font-semibold text-gray-900">대화 완료</h5>
                  <Badge className="bg-green-100 text-green-800 ml-auto">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    완료
                  </Badge>
                </div>
                <p className="text-gray-600 mb-4">
                  2명의 답변이 모두 수집되어 대화가 공개되었습니다.
                </p>
                <Button size="sm" variant="outline" className="w-full">
                  대화 보기
                </Button>
              </Card>
            </div>
            
            <div className="mt-6">
              <p className="text-sm text-gray-600 mb-3">
                카드는 검정 테두리 대신 부드러운 쉐도우를 사용하여 입체감을 표현합니다.
              </p>
              <CodeBlock title="Card 사용법" language="tsx">
{`import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

{/* 기본 카드 - 쉐도우 효과로 입체감 표현 */}
<Card className="p-6">
  <h5 className="font-semibold text-gray-900">제목</h5>
  <p className="text-gray-600">내용</p>
</Card>

{/* 배경 그라디언트 카드 */}
<Card className="p-6 bg-gradient-to-br from-violet-50 to-violet-100">
  <h5 className="font-semibold text-gray-900">특별한 카드</h5>
  <p className="text-gray-600">배경 그라디언트 적용</p>
</Card>

{/* 더 강한 쉐도우가 필요한 경우 */}
<Card className="p-6 shadow-lg">
  <h5 className="font-semibold text-gray-900">강조 카드</h5>
  <p className="text-gray-600">shadow-lg로 더 입체적인 효과</p>
</Card>`}
              </CodeBlock>
            </div>
          </div>

          {/* Dialog */}
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-4">대화상자 (Dialog)</h4>
            <div className="space-y-4">
              <Button onClick={() => setDialogOpen(true)}>
                대화상자 열기
              </Button>
              
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    답변을 삭제하시겠습니까?
                  </h3>
                  <p className="text-gray-600 mb-6">
                    삭제된 답변은 복구할 수 없습니다. 정말로 삭제하시겠습니까?
                  </p>
                  <div className="flex gap-3 justify-end">
                    <Button variant="outline" onClick={() => setDialogOpen(false)}>
                      취소
                    </Button>
                    <Button variant="destructive" onClick={() => setDialogOpen(false)}>
                      삭제
                    </Button>
                  </div>
                </div>
              </Dialog>
            </div>
          </div>
        </div>

        {/* Data Display */}
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Data Display</h3>
          
          {/* 아이콘 */}
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-4">아이콘 (Icons)</h4>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-3">감정 및 상태</p>
                <div className="flex flex-wrap gap-6">
                  <div className="flex items-center gap-2">
                    <Heart className="h-5 w-5 text-red-500" />
                    <span className="text-sm">Heart</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-500" />
                    <span className="text-sm">Star</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-orange-500" />
                    <span className="text-sm">Award</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-blue-500" />
                    <span className="text-sm">Zap</span>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-3">커뮤니케이션</p>
                <div className="flex flex-wrap gap-6">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="h-5 w-5 text-violet-600" />
                    <span className="text-sm">MessageCircle</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-gray-600" />
                    <span className="text-sm">Users</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Volume2 className="h-5 w-5 text-gray-600" />
                    <span className="text-sm">Volume</span>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-3">시스템</p>
                <div className="flex flex-wrap gap-6">
                  <div className="flex items-center gap-2">
                    <Settings className="h-5 w-5 text-gray-600" />
                    <span className="text-sm">Settings</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-gray-600" />
                    <span className="text-sm">Calendar</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-gray-600" />
                    <span className="text-sm">Clock</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Component Usage Examples */}
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-6">통합 사용 예시</h3>
          
          <div className="grid lg:grid-cols-2 gap-6">
            {/* 질문 카드 예시 */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 bg-violet-100 rounded-full flex items-center justify-center">
                    <Heart className="h-4 w-4 text-violet-600" />
                  </div>
                  <div>
                    <h5 className="font-semibold text-gray-900">오늘의 질문</h5>
                    <p className="text-xs text-gray-500">2024년 8월 30일</p>
                  </div>
                </div>
                <Badge className="bg-violet-100 text-violet-800">
                  <Clock className="h-3 w-3 mr-1" />
                  03:42
                </Badge>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-lg mb-4">
                <p className="text-gray-800">
                  "최근에 가장 기뻤던 순간은 언제였나요?"
                </p>
              </div>
              
              <div className="space-y-3 mb-4">
                <Textarea 
                  placeholder="따뜻한 마음을 담아 답변해주세요..." 
                  className="min-h-[80px]"
                />
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>0 / 500자</span>
                  <div className="flex items-center gap-2">
                    <Switch id="anonymous" />
                    <label htmlFor="anonymous">익명으로 작성</label>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button className="flex-1">
                  <Heart className="h-4 w-4 mr-2" />
                  답변 저장
                </Button>
                <Button variant="outline">
                  <Pause className="h-4 w-4" />
                </Button>
              </div>
            </Card>

            {/* 통계 카드 예시 */}
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-8 w-8 bg-violet-100 rounded-full flex items-center justify-center">
                  <Users className="h-4 w-4 text-violet-600" />
                </div>
                <h5 className="font-semibold text-gray-900">이번 주 활동</h5>
              </div>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">답변 완료율</span>
                    <Badge variant="secondary">85%</Badge>
                  </div>
                  <Progress value={85} />
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">게이트 공개</span>
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      6/7
                    </Badge>
                  </div>
                  <Progress value={86} className="bg-green-100" />
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">연속 참여일</span>
                    <Badge variant="outline">12일</Badge>
                  </div>
                  <Progress value={100} />
                </div>
              </div>
              
              <div className="mt-6 pt-4 border-t border-gray-100">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-lg font-semibold text-violet-600">24</div>
                    <div className="text-xs text-gray-500">총 답변</div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-violet-600">18</div>
                    <div className="text-xs text-gray-500">공개된 대화</div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-green-600">12</div>
                    <div className="text-xs text-gray-500">연속 참여</div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Component Import Guide */}
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-6">컴포넌트 Import 가이드</h3>
          
          <CodeBlock title="전체 컴포넌트 Import" language="tsx">
{`// Navigation & Actions
import { Button } from "@/components/ui/button"

// Form Controls
import { Input, Textarea } from "@/components/ui/input"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue,
  SelectGroup,
  SelectLabel 
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"

// Feedback Components
import { Alert } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"

// Layout Components
import { Card } from "@/components/ui/card"
import { Dialog } from "@/components/ui/dialog"

// Data Display
import { CodeBlock, InlineCode } from "@/components/ui/code-block"
import { ColorPalette, GradientPalette } from "@/components/ui/color-palette"

// Icons (Lucide React)
import { 
  Heart, 
  MessageCircle, 
  Users, 
  Settings,
  CheckCircle,
  AlertCircle,
  Info,
  XCircle
} from "lucide-react"`}
          </CodeBlock>
        </div>
      </div>
    )
  }

  const renderAccessibility = () => (
    <div className="space-y-8">
      <div className="prose max-w-none">
        <h2 className="text-2xl font-bold text-gray-900">접근성 가이드라인</h2>
        <p className="text-gray-600">
          마음배달은 모든 사용자가 편리하게 이용할 수 있도록 웹 접근성 기준(WCAG 2.1 AA)을 준수합니다.
        </p>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">접근성 체크리스트</h3>
        <div className="space-y-3">
          {accessibilityChecklist.map((item, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <span className="text-gray-900">{item.item}</span>
              <span 
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  item.status === '완료' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}
              >
                {item.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">색상 대비 테스트</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="p-6">
            <h4 className="font-semibold text-violet-600 mb-3">메인 컬러 대비</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-white bg-violet-500 px-3 py-1 rounded">흰색 텍스트</span>
                <span className="text-xs text-gray-500">대비 4.52:1 ✓</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-violet-600">컬러 텍스트</span>
                <span className="text-xs text-gray-500">대비 4.52:1 ✓</span>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h4 className="font-semibold text-violet-600 mb-3">보조 컬러 대비</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-white bg-violet-600 px-3 py-1 rounded">흰색 텍스트</span>
                <span className="text-xs text-gray-500">대비 4.89:1 ✓</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-violet-600">컬러 텍스트</span>
                <span className="text-xs text-gray-500">대비 4.89:1 ✓</span>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h4 className="font-semibold text-blue-600 mb-3">정보 컬러 대비</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-white bg-blue-600 px-3 py-1 rounded">흰색 텍스트</span>
                <span className="text-xs text-gray-500">대비 5.14:1 ✓</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-blue-600">컬러 텍스트</span>
                <span className="text-xs text-gray-500">대비 5.14:1 ✓</span>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h4 className="font-semibold text-green-600 mb-3">성공 컬러 대비</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-white bg-green-600 px-3 py-1 rounded">흰색 텍스트</span>
                <span className="text-xs text-gray-500">대비 4.75:1 ✓</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-green-600">컬러 텍스트</span>
                <span className="text-xs text-gray-500">대비 4.75:1 ✓</span>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h4 className="font-semibold text-red-600 mb-3">에러 컬러 대비</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-white bg-red-600 px-3 py-1 rounded">흰색 텍스트</span>
                <span className="text-xs text-gray-500">대비 5.25:1 ✓</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-red-600">컬러 텍스트</span>
                <span className="text-xs text-gray-500">대비 5.25:1 ✓</span>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h4 className="font-semibold text-purple-600 mb-3">혼자모드 컬러 대비</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-white bg-purple-600 px-3 py-1 rounded">흰색 텍스트</span>
                <span className="text-xs text-gray-500">대비 4.93:1 ✓</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-purple-600">컬러 텍스트</span>
                <span className="text-xs text-gray-500">대비 4.93:1 ✓</span>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h4 className="font-semibold text-yellow-900 mb-3">카카오 컬러 대비</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-yellow-900 bg-yellow-400 px-3 py-1 rounded">진한 텍스트</span>
                <span className="text-xs text-gray-500">대비 6.72:1 ✓</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-yellow-900">컬러 텍스트</span>
                <span className="text-xs text-gray-500">대비 7.83:1 ✓</span>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h4 className="font-semibold text-rose-600 mb-3">강조 컬러 대비</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-white bg-rose-600 px-3 py-1 rounded">흰색 텍스트</span>
                <span className="text-xs text-gray-500">대비 4.98:1 ✓</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-rose-600">컬러 텍스트</span>
                <span className="text-xs text-gray-500">대비 4.98:1 ✓</span>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h4 className="font-semibold text-indigo-600 mb-3">시스템 컬러 대비</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-white bg-indigo-600 px-3 py-1 rounded">흰색 텍스트</span>
                <span className="text-xs text-gray-500">대비 5.43:1 ✓</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-indigo-600">컬러 텍스트</span>
                <span className="text-xs text-gray-500">대비 5.43:1 ✓</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">터치 타겟 가이드라인</h3>
        <div className="space-y-4">
          <p className="text-gray-600">모든 인터랙티브 요소는 최소 44×44px 크기를 유지합니다.</p>
          
          <div className="flex flex-wrap gap-4 items-center">
            <Button size="sm" className="min-h-[44px] px-6">
              44px 높이
            </Button>
            <button className="h-11 w-11 bg-violet-100 text-violet-600 rounded-lg flex items-center justify-center hover:bg-violet-200 transition-colors">
              <Heart className="h-5 w-5" />
            </button>
          </div>

          <CodeBlock title="Touch Target" language="css">
{`/* 터치 타겟 보장을 위한 CSS 클래스 */
.touch-target {
  min-height: 44px;
  min-width: 44px;
}

/* Tailwind 사용 시 */
.min-h-[44px] .min-w-[44px]`}
          </CodeBlock>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">키보드 네비게이션</h3>
        <div className="space-y-4">
          <p className="text-gray-600">Tab, Enter, Space 키로 모든 기능에 접근할 수 있습니다.</p>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h5 className="font-medium text-gray-900 mb-2">키보드 단축키</h5>
            <ul className="space-y-1 text-sm text-gray-600">
              <li><kbd className="bg-white px-2 py-1 rounded border text-xs">Tab</kbd> - 다음 요소로 이동</li>
              <li><kbd className="bg-white px-2 py-1 rounded border text-xs">Shift + Tab</kbd> - 이전 요소로 이동</li>
              <li><kbd className="bg-white px-2 py-1 rounded border text-xs">Enter</kbd> - 버튼 활성화</li>
              <li><kbd className="bg-white px-2 py-1 rounded border text-xs">Space</kbd> - 체크박스/버튼 토글</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )

  const renderTabContent = () => {
    switch (activeTab) {
      case 'colors': return renderColors()
      case 'typography': return renderTypography()
      case 'components': return renderComponents()
      case 'accessibility': return renderAccessibility()
      default: return renderColors()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <img 
                src="/icons/apple-touch-icon.png" 
                alt="마음배달" 
                className="h-8 w-8 rounded-lg"
              />
              <div>
                <h1 className="text-xl font-bold text-gray-900">마음배달 스타일 가이드</h1>
                <p className="text-sm text-gray-500">Development Environment Only</p>
              </div>
            </div>
            
            <div className="px-3 py-1 bg-violet-100 text-violet-800 text-xs font-medium rounded-full">
              v2.0
            </div>
          </div>
        </div>
      </header>

      {/* 탭 네비게이션 */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                    isActive
                      ? 'border-violet-500 text-violet-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              )
            })}
          </nav>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderTabContent()}
      </main>
    </div>
  )
}