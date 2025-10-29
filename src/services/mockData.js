// src/services/mockData.js

/**
 * Доступные статусы проекта
 * - in_progress — в работе
 * - finished    — завершён
 * - on_hold     — на паузе
 */
export const PROJECT_STATUSES = ['in_progress', 'finished', 'on_hold'];

/* =========================
 * Проекты (мок-данные)
 * Поля: id, name, kunde, manager, status
 * ========================= */
export const mockProjects = [
    {
        id: 'p-1001',
        name: 'EBAP',
        kunde: 'E.ON',
        manager: 'Maria Mustermann',
        status: 'in_progress',
    },
    {
        id: 'p-1002',
        name: 'EBUQM',
        kunde: 'E.ON',
        manager: 'Max Mustermann',
        status: 'on_hold',
    },
    {
        id: 'p-1003',
        name: 'SEMESS',
        kunde: 'Siemens Energy Global GmbH',
        manager: 'Maria Mustermann',
        status: 'finished',
    },
    // Добавьте при необходимости ещё примеры:
    {
        id: 'p-1004',
        name: 'WN6MAW',
        kunde: 'Westnetz GmbH',
        manager: 'Max Mustermann',
        status: 'in_progress',
    },
];

/* =========================
 * Утилиты по проектам
 * ========================= */

/**
 * Синхронно возвращает копию всех проектов (удобно для локального state).
 * @returns {Array}
 */
export function fetchProjects() {
    return [...mockProjects];
}

/**
 * Асинхронно возвращает проекты с учётом роли пользователя:
 * - admin/auditor: все проекты
 * - manager: только проекты, где он manager
 * @param {{role:string, name:string}} user
 * @returns {Promise<Array>}
 */
export function fetchProjectsAsync(user) {
    return new Promise((resolve) => {
        setTimeout(() => {
            if (!user?.role) return resolve([]);
            if (user.role === 'admin' || user.role === 'auditor') {
                resolve([...mockProjects]);
            } else if (user.role === 'manager') {
                resolve(mockProjects.filter((p) => p.manager === user.name));
            } else {
                resolve([]);
            }
        }, 300);
    });
}

/**
 * Синхронная фильтрация по пользователю (если нужно без промиса).
 * @param {{role:string, name:string}} user
 * @returns {Array}
 */
export function filterProjectsForUser(user) {
    if (!user?.role) return [];
    if (user.role === 'admin' || user.role === 'auditor') {
        return [...mockProjects];
    }
    if (user.role === 'manager') {
        return mockProjects.filter((p) => p.manager === user.name);
    }
    return [];
}

/**
 * Получить проект по id
 * @param {string} id
 * @returns {object | undefined}
 */
export function getProjectById(id) {
    return mockProjects.find((p) => p.id === id);
}

/**
 * Создать новый проект (и поместить в начало списка).
 * Ожидаемые поля: name, kunde, manager, status
 * @param {{name:string, kunde:string, manager:string, status: 'in_progress'|'finished'|'on_hold'}} values
 * @returns {object} созданный проект
 */
export function createProject(values) {
    const id = `p-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

    const status = PROJECT_STATUSES.includes(values.status)
        ? values.status
        : 'in_progress';

    const project = {
        id,
        name: String(values.name || '').trim(),
        kunde: String(values.kunde || '').trim(),
        manager: String(values.manager || '').trim(),
        status,
    };

    mockProjects.unshift(project);
    return project;
}

/**
 * Обновить проект по id.
 * @param {string} id
 * @param {Partial<{name:string, kunde:string, manager:string, status:string}>} patch
 * @returns {object|null} обновлённый проект или null, если не найден
 */
export function updateProject(id, patch = {}) {
    const i = mockProjects.findIndex((p) => p.id === id);
    if (i === -1) return null;

    const next = { ...mockProjects[i], ...patch };
    if (next.status && !PROJECT_STATUSES.includes(next.status)) {
        next.status = mockProjects[i].status;
    }
    mockProjects[i] = next;
    return next;
}

/**
 * Удалить проект по id.
 * @param {string} id
 * @returns {boolean} true, если удалили
 */
export function deleteProject(id) {
    const before = mockProjects.length;
    const idx = mockProjects.findIndex((p) => p.id === id);
    if (idx === -1) return false;
    mockProjects.splice(idx, 1);
    return mockProjects.length < before;
}
/* =========================
 * Глобальное логирование
 * ========================= */

const GLOBAL_LOG_KEY = 'globalActivityLog';
const MAX_LOG_ENTRIES = 20;

/**
 * Записывает событие в глобальный лог в localStorage.
 * @param {object} event - Объект события {kind, by, ts, message, projectName}
 */
export function logGlobalEvent(event) {
    try {
        const existingLogRaw = localStorage.getItem(GLOBAL_LOG_KEY);
        const existingLog = existingLogRaw ? JSON.parse(existingLogRaw) : [];

        const newLog = [event, ...existingLog];

        if (newLog.length > MAX_LOG_ENTRIES) {
            newLog.length = MAX_LOG_ENTRIES;
        }

        localStorage.setItem(GLOBAL_LOG_KEY, JSON.stringify(newLog));
    } catch (error) {
        console.error("Failed to write to global log", error);
    }
}

/**
 * Читает события из глобального лога.
 * @returns {Array} - Массив событий
 */
export function getGlobalEvents() {
    try {
        const logRaw = localStorage.getItem(GLOBAL_LOG_KEY);
        return logRaw ? JSON.parse(logRaw) : [];
    } catch (error) {
        console.error("Failed to read global log", error);
        return [];
    }
}

const TEMPLATES_KEY = 'qc-templates';

/**
 * Возвращает все сохраненные шаблоны.
 * @returns {Array<{name: string, items: string[]}>}
 */
export function getTemplates() {
    try {
        const templatesRaw = localStorage.getItem(TEMPLATES_KEY);
        return templatesRaw ? JSON.parse(templatesRaw) : [];
    } catch (e) {
        return [];
    }
}

/**
 * Сохраняет или обновляет шаблон.
 * @param {string} name - Имя шаблона.
 * @param {string[]} items - Массив inspection items.
 */
export function saveTemplate(name, items) {
    const templates = getTemplates();
    const existingIndex = templates.findIndex(t => t.name === name);

    if (existingIndex > -1) {
        templates[existingIndex].items = items;
    } else {
        templates.push({ name, items });
    }
    localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates));
}

/**
 * Удаляет шаблон по имени.
 * @param {string} name - Имя шаблона для удаления.
 */
export function deleteTemplate(name) {
    let templates = getTemplates();
    templates = templates.filter(t => t.name !== name);
    localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates));
}