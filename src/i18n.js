// src/i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

i18n
    .use(initReactI18next)
    .init({
        resources: {
            en: {
                translation: {
                    common: { cancel: 'Cancel', createOk: 'Create' },
                    /* ---------- MENU ---------- */
                    menu: {
                        projects: 'Projects',
                        users: 'Users',
                        settings: 'Settings',
                        archive: 'Archive',
                    },
                    /* ---------- TABLE HEADERS ---------- */
                    table: {
                        pruefungsgegenstand: 'Inspection Item',
                        massnahme: 'Measure',
                        autor: 'Author',
                        pruefer: 'Reviewer',
                        planTermin: 'Planned Date',
                        istTermin: 'Actual Date',
                        dokument: 'Document',
                        status: 'Status',
                        bemerkungen: 'Remarks',
                    },
                    /* ---------- ITEM STATUSES ---------- */
                    itemStatus: {
                        approved: 'Approved',
                        rejected: 'Rejected',
                        pending: 'Pending for approval',
                        open: 'Open',
                    },
                    /* ---------- FILTER LABELS ---------- */
                    filter: {
                        lamine: 'Lamine',
                        judith: 'Judith',
                        artem: 'Artem',
                        closed: 'Closed (✓)',
                        open: 'Open (✗)',
                    },
                    /* ---------- LOGIN ---------- */
                    login: {
                        username: 'Username',
                        password: 'Password',
                        remember: 'Remember me',
                        forgot: 'Forgot password',
                        login: 'Log in',
                        usernameMsg: 'Please input your Username!',
                        passwordMsg: 'Please input your Password!',
                        invalidCredentials: 'Invalid username or password',
                    },
                    /* ---------- GENERAL & PROJECTS ---------- */
                    logout: 'Logout',
                    projects: {
                        allProjects: 'All Projects',
                        myProjects: 'My Projects',
                        create: 'Create Project',
                        manager: 'Manager',
                        notFound: 'Project not found',
                        status: {
                            in_progress: 'In progress',
                            finished: 'Finished',
                            on_hold: 'On hold',
                        },
                        filters: {
                            search: 'Search by name or customer',
                            kundeAll: 'All customers',
                            statusAll: 'All statuses',
                            reset: 'Reset filters',
                        },
                        form: {
                            name: 'Project name',
                            nameMsg: 'Please enter the project name!',
                            kunde: 'Customer (Kunde)',
                            kundeMsg: 'Please enter the customer!',
                            manager: 'Manager',
                            managerMsg: 'Please enter the manager!',
                            status: 'Status',
                            statusMsg: 'Please select the status!',
                        },
                    },
                    /* ---------- USERS PAGE ---------- */
                    usersPage: {
                        title: 'User Management',
                        addUser: 'Add User',
                        table: { name: 'Name', username: 'Username', role: 'Role', action: 'Action', edit: 'Edit' },
                        addUserModal: {
                            title: 'Create a New User',
                            editTitle: 'Edit User',
                            name: 'Full Name',
                            nameMsg: 'Please enter the full name!',
                            username: 'Username',
                            usernameMsg: 'Please enter the username!',
                            password: 'Password',
                            passwordMsg: 'Please enter the password!',
                            role: 'Role',
                            roleMsg: 'Please select a role!',
                            admin: 'Admin',
                            auditor: 'Auditor',
                            manager: 'Manager',
                            cancel: 'Cancel',
                            create: 'Create',
                            save: 'Save'
                        }
                    },
                    /* ---------- SETTINGS PAGE ---------- */
                    settingsPage: {
                        title: 'Settings',
                        personal: {
                            title: 'Personal Settings',
                            description: 'Here you can change your password and notification preferences.',
                        },
                        templates: {
                            title: 'Criteria Templates',
                            description: 'Here you can create and manage templates for new projects.',
                        },
                        global: {
                            title: 'Global Application Settings',
                            description: 'Here you can manage integrations and data archiving rules.',
                        }
                    },
                },
            },
            de: {
                translation: {
                    common: { cancel: 'Abbrechen', createOk: 'Erstellen' },
                    /* ---------- MENU ---------- */
                    menu: {
                        projects: 'Projekte',
                        users: 'Benutzer',
                        settings: 'Einstellungen',
                        archive: 'Archiv',
                    },
                    /* ---------- TABLE HEADERS ---------- */
                    table: {
                        pruefungsgegenstand: 'Prüfungsgegenstand',
                        massnahme: 'Maßnahme',
                        autor: 'Autor',
                        pruefer: 'Prüfer',
                        planTermin: 'Plan-Termin',
                        istTermin: 'Ist-Termin',
                        dokument: 'Dokument',
                        status: 'Status',
                        bemerkungen: 'Bemerkungen',
                    },
                    /* ---------- ITEM STATUSES ---------- */
                    itemStatus: {
                        approved: 'Genehmigt',
                        rejected: 'Abgelehnt',
                        pending: 'Wartet auf Genehmigung',
                        open: 'Offen',
                    },
                    /* ---------- FILTER LABELS ---------- */
                    filter: {
                        lamine: 'Lamine',
                        judith: 'Judith',
                        artem: 'Artem',
                        closed: 'Geschlossen (✓)',
                        open: 'Offen (✗)',
                    },
                    /* ---------- LOGIN ---------- */
                    login: {
                        username: 'Benutzername',
                        password: 'Passwort',
                        remember: 'Angemeldet bleiben',
                        forgot: 'Passwort vergessen',
                        login: 'Anmelden',
                        usernameMsg: 'Bitte Benutzernamen eingeben!',
                        passwordMsg: 'Bitte Passwort eingeben!',
                        invalidCredentials: 'Ungültiger Benutzername oder Passwort',
                    },
                    /* ---------- GENERAL & PROJECTS ---------- */
                    logout: 'Abmelden',
                    projects: {
                        allProjects: 'Alle Projekte',
                        myProjects: 'Meine Projekte',
                        create: 'Projekt erstellen',
                        manager: 'Manager',
                        notFound: 'Projekt nicht gefunden',
                        status: {
                            in_progress: 'In Bearbeitung',
                            finished: 'Abgeschlossen',
                            on_hold: 'Pausiert',
                        },
                        filters: {
                            search: 'Suche nach Name oder Kunde',
                            kundeAll: 'Alle Kunden',
                            statusAll: 'Alle Status',
                            reset: 'Filter zurücksetzen',
                        },
                        form: {
                            name: 'Projektname',
                            nameMsg: 'Bitte geben Sie den Projektnamen ein!',
                            kunde: 'Kunde',
                            kundeMsg: 'Bitte geben Sie den Kunden ein!',
                            manager: 'Manager',
                            managerMsg: 'Bitte geben Sie den Manager ein!',
                            status: 'Status',
                            statusMsg: 'Bitte wählen Sie den Status!',
                        },
                    },
                    /* ---------- USERS PAGE ---------- */
                    usersPage: {
                        title: 'Benutzerverwaltung',
                        addUser: 'Benutzer hinzufügen',
                        table: { name: 'Name', username: 'Benutzername', role: 'Rolle', action: 'Aktion', edit: 'Bearbeiten' },
                        addUserModal: {
                            title: 'Neuen Benutzer erstellen',
                            editTitle: 'Benutzer bearbeiten',
                            name: 'Vollständiger Name',
                            nameMsg: 'Bitte geben Sie den vollständigen Namen ein!',
                            username: 'Benutzername',
                            usernameMsg: 'Bitte geben Sie den Benutzernamen ein!',
                            password: 'Passwort',
                            passwordMsg: 'Bitte geben Sie das Passwort ein!',
                            role: 'Rolle',
                            roleMsg: 'Bitte wählen Sie eine Rolle aus!',
                            admin: 'Admin',
                            auditor: 'Auditor',
                            manager: 'Manager',
                            cancel: 'Abbrechen',
                            create: 'Erstellen',
                            save: 'Speichern'
                        }
                    },
                    /* ---------- SETTINGS PAGE ---------- */
                    settingsPage: {
                        title: 'Einstellungen',
                        personal: {
                            title: 'Persönliche Einstellungen',
                            description: 'Hier können Sie Ihr Passwort und Ihre Benachrichtigungseinstellungen ändern.',
                        },
                        templates: {
                            title: 'Kriterienvorlagen',
                            description: 'Hier können Sie Vorlagen für neue Projekte erstellen und verwalten.',
                        },
                        global: {
                            title: 'Globale Anwendungseinstellungen',
                            description: 'Hier können Sie Integrationen und Datenarchivierungsregeln verwalten.',
                        }
                    },
                },
            },
        },
        lng: 'de',
        fallbackLng: 'en',
        interpolation: { escapeValue: false },
    });

export default i18n;