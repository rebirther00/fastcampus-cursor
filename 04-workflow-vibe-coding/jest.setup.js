import '@testing-library/jest-dom'

// Ensure jest-dom matchers are available globally
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { default: matchers } = require('@testing-library/jest-dom/matchers');
  expect.extend(matchers);
} catch {
  // Fallback for older versions
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  expect.extend(require('@testing-library/jest-dom/matchers'));
}

// Global test setup
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock react-draggable
jest.mock('react-draggable', () => {
  return function MockDraggable({ children, ...props }) {
    return <div data-testid="draggable" {...props}>{children}</div>
  }
})

// Mock @dnd-kit/core for testing
jest.mock('@dnd-kit/core', () => ({
  DndContext: ({ children, onDragStart, onDragEnd, ...props }) => (
    <div data-testid="dnd-context" {...props}>
      {children}
    </div>
  ),
  useDraggable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: jest.fn(),
    transform: null,
    isDragging: false,
  }),
  useDroppable: () => ({
    setNodeRef: jest.fn(),
    isOver: false,
  }),
  DragOverlay: ({ children }) => <div data-testid="drag-overlay">{children}</div>,
  closestCenter: jest.fn(),
  PointerSensor: jest.fn(),
  useSensor: jest.fn(),
  useSensors: jest.fn(() => []),
}));

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props) => <img {...props} />,
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn(),
    has: jest.fn(),
  }),
  usePathname: () => '/',
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Loader2: (props) => <div role="status" data-testid="loader" {...props} />,
  Plus: (props) => <div data-testid="plus-icon" {...props} />,
  Settings: (props) => <div data-testid="settings-icon" {...props} />,
  User: (props) => <div data-testid="user-icon" {...props} />,
  Crown: (props) => <div data-testid="crown-icon" {...props} />,
  Clock: (props) => <div data-testid="clock-icon" {...props} />,
  MessageSquare: (props) => <div data-testid="message-icon" {...props} />,
  Paperclip: (props) => <div data-testid="paperclip-icon" {...props} />,
  Users: (props) => <div data-testid="users-icon" {...props} />,
  AlertCircle: (props) => <div data-testid="alert-circle-icon" {...props} />,
  CheckCircle: (props) => <div data-testid="check-circle-icon" {...props} />,
  Timer: (props) => <div data-testid="timer-icon" {...props} />,
  AlertTriangle: (props) => <div data-testid="alert-triangle-icon" {...props} />,
  X: (props) => <div data-testid="x-icon" {...props} />,
  ChevronDown: (props) => <div data-testid="chevron-down-icon" {...props} />,
  Calendar: (props) => <div data-testid="calendar-icon" {...props} />,
  Tag: (props) => <div data-testid="tag-icon" {...props} />,
  Save: (props) => <div data-testid="save-icon" {...props} />,
  Edit: (props) => <div data-testid="edit-icon" {...props} />,
  Trash: (props) => <div data-testid="trash-icon" {...props} />,
}));

// Mock sonner toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    warning: jest.fn(),
    loading: jest.fn(),
    dismiss: jest.fn(),
  },
  Toaster: () => <div data-testid="toaster" />,
}));

// Console error/warning 억제 (테스트 환경에서만)
const originalError = console.error;
const originalWarn = console.warn;

beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' && 
      (
        args[0].includes('Warning: ReactDOM.render is deprecated') ||
        args[0].includes('Warning: findDOMNode is deprecated') ||
        args[0].includes('act(...) is not supported')
      )
    ) {
      return;
    }
    originalError.call(console, ...args);
  };

  console.warn = (...args) => {
    if (
      typeof args[0] === 'string' && 
      (
        args[0].includes('componentWillReceiveProps has been renamed') ||
        args[0].includes('componentWillMount has been renamed')
      )
    ) {
      return;
    }
    originalWarn.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
  console.warn = originalWarn;
});