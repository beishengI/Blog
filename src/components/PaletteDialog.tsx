import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useConfig } from '../context/ConfigContext';
import { usePosts } from '../context/PostsContext';
import {
  COMMAND_GROUPS,
  buildCommands,
  filterCommands,
  type Command,
} from '../data/commands';
import { isSoundEnabled, playScanTone, setSoundEnabled } from '../utils/sound';
import { asset } from '../showcase/parts';

function legacyCopy(text: string): boolean {
  const area = document.createElement('textarea');
  area.value = text;
  area.style.position = 'fixed';
  area.style.opacity = '0';
  document.body.appendChild(area);
  area.select();
  const ok = document.execCommand('copy');
  area.remove();
  return ok;
}

/** 调阅面板：居中纸面卡片，键盘优先（combobox + aria-activedescendant），鼠标可用。 */
export default function PaletteDialog({ onClose }: { onClose: () => void }) {
  const { config, effectiveMode, toggleMode } = useConfig();
  const { allPosts } = usePosts();
  const navigate = useNavigate();

  const [query, setQuery] = useState('');
  const [deferred, setDeferred] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const [message, setMessage] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const commands = useMemo(() => buildCommands(allPosts), [allPosts]);
  const results = useMemo(() => filterCommands(commands, deferred), [commands, deferred]);
  const grouped = COMMAND_GROUPS.map(group => ({
    group,
    items: results
      .map((command, index) => ({ command, index }))
      .filter(item => item.command.group === group),
  })).filter(section => section.items.length > 0);

  useEffect(() => {
    const timer = window.setTimeout(() => setDeferred(query), 60);
    return () => window.clearTimeout(timer);
  }, [query]);

  useEffect(() => setActiveIndex(0), [deferred]);

  useEffect(() => {
    inputRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    document.getElementById(`cmd-option-${activeIndex}`)?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex]);

  useEffect(() => {
    if (!message) return;
    const timer = window.setTimeout(() => setMessage(''), 2600);
    return () => window.clearTimeout(timer);
  }, [message]);

  const copyEmail = async () => {
    const email = config.site.contact.email;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(email);
      } else if (!legacyCopy(email)) {
        throw new Error('legacy copy rejected');
      }
      setMessage(`已复制 ${email}`);
    } catch {
      try {
        if (legacyCopy(email)) setMessage(`已复制 ${email}`);
        else setMessage(`复制失败，请手动复制：${email}`);
      } catch {
        setMessage(`复制失败，请手动复制：${email}`);
      }
    }
  };

  const execute = (command: Command | undefined) => {
    if (!command) return;
    if (command.to) {
      navigate(command.to);
      onClose();
      return;
    }
    switch (command.action) {
      case 'theme':
        toggleMode();
        setMessage(effectiveMode === 'dark' ? '已切换到日间模式' : '已切换到夜间模式');
        break;
      case 'sound': {
        const next = !isSoundEnabled();
        setSoundEnabled(next);
        if (next) playScanTone('open');
        setMessage(next ? '界面声音已开启' : '界面声音已关闭');
        break;
      }
      case 'resume': {
        const anchor = document.createElement('a');
        anchor.href = asset(config.site.resumePdf);
        anchor.download = '';
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
        setMessage('简历 PDF 下载已开始');
        break;
      }
      case 'email':
        void copyEmail();
        break;
      case 'github':
        window.open(`https://github.com/${config.site.contact.github}`, '_blank', 'noreferrer');
        onClose();
        break;
      default:
        break;
    }
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      onClose();
      return;
    }
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      const delta = event.key === 'ArrowDown' ? 1 : -1;
      setActiveIndex(index => (results.length ? (index + delta + results.length) % results.length : 0));
      return;
    }
    if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      setActiveIndex(event.key === 'Home' ? 0 : Math.max(0, results.length - 1));
      return;
    }
    if (event.key === 'Enter') {
      event.preventDefault();
      execute(results[activeIndex]);
      return;
    }
    if (event.key === 'Tab') {
      const focusables = Array.from(
        panelRef.current?.querySelectorAll<HTMLElement>('input, button:not([disabled])') ?? []
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  };

  return (
    <div
      className="cmd"
      data-cmd-open="true"
      onClick={event => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className="cmd__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cmd-title"
        ref={panelRef}
        onKeyDown={onKeyDown}
      >
        <div className="cmd__head">
          <span className="cmd__title" id="cmd-title">调阅面板 / INDEX</span>
          <button type="button" className="cmd__close" onClick={onClose} aria-label="收回调阅面板">
            ESC ×
          </button>
        </div>

        <div className="cmd__field">
          <span className="cmd__prompt" aria-hidden="true">⌘K</span>
          <input
            ref={inputRef}
            role="combobox"
            aria-expanded="true"
            aria-controls="cmd-list"
            aria-activedescendant={results.length ? `cmd-option-${activeIndex}` : undefined}
            aria-label="检索作品、文章、知识库或执行动作"
            value={query}
            onChange={event => setQuery(event.target.value)}
            placeholder="输入以调阅：作品 / 文章 / 知识库 / 动作…"
            autoComplete="off"
            spellCheck={false}
          />
        </div>

        <div className="cmd__list" id="cmd-list" role="listbox" aria-label="命令结果">
          {results.length === 0 && (
            <p className="cmd__empty">没有匹配项。试试「分割」「迁移」「简历」。</p>
          )}
          {grouped.map(section => (
            <div key={section.group}>
              <div className="cmd__group" aria-hidden="true">{section.group}</div>
              {section.items.map(({ command, index }) => (
                <button
                  key={command.id}
                  type="button"
                  role="option"
                  id={`cmd-option-${index}`}
                  aria-selected={index === activeIndex}
                  className={`cmd__option ${index === activeIndex ? 'is-active' : ''}`}
                  onMouseDown={event => event.preventDefault()}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => execute(command)}
                >
                  <span className="cmd__option-title">{command.title}</span>
                  {command.hint && <span className="cmd__option-hint">{command.hint}</span>}
                </button>
              ))}
            </div>
          ))}
        </div>

        <div className="cmd__foot">
          <span>↑↓ 选择 · ENTER 执行 · ESC 收回</span>
          <span className="cmd__status" role="status">
            {message ? <b>{message}</b> : `${results.length} 项`}
          </span>
        </div>
      </div>
    </div>
  );
}
