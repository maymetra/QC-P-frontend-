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
                        overdue: 'Overdue Items',
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
                            basePlannedDate: 'Base Planned Date for Template Items',
                            basePlannedDateMsg: 'Please select a base planned date',

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
                            title: 'Templates',
                            description: 'Manage templates for inspection items. Templates can be used when creating new projects.',
                            create: 'Create Template',
                            createTitle: 'Create New Template',
                            editTitle: 'Edit Template',
                            name: 'Template Name',
                            items: 'Inspection Items',
                            deleteConfirm: 'Delete this template?',
                            select: 'Optional: Select a template to pre-fill items', // <-- Добавлено для формы проекта
                        },
                        global: {
                            title: 'Global Application Settings',
                            description: 'Here you can manage integrations and data archiving rules.',
                        },
                        kb: {
                            title: 'Knowledge Base',
                            description: 'Add new items to the knowledge base. They will become available for use in templates.',
                            addItem: 'Add Item',
                            modalTitle: 'Add to Knowledge Base',
                            categoryLabel: 'Category',
                            categoryMsg: 'Please select or create a category!',
                            categoryPlaceholder: 'Select or type a new category',
                            itemLabel: 'Item Text',
                            itemMsg: 'Please enter the item text!',
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
                        overdue: 'Überfällige Posten',
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
                            basePlannedDate: 'Geplantes Startdatum für Vorlagenpunkte',
                            basePlannedDateMsg: 'Bitte wählen Sie ein geplantes Startdatum',
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
                            title: 'Vorlagen',
                            description: 'Verwalten Sie Vorlagen für Prüfpositionen. Vorlagen können beim Erstellen neuer Projekte verwendet werden.',
                            create: 'Vorlage erstellen',
                            createTitle: 'Neue Vorlage erstellen',
                            editTitle: 'Vorlage bearbeiten',
                            name: 'Vorlagenname',
                            items: 'Prüfpositionen',
                            deleteConfirm: 'Diese Vorlage löschen?',
                            select: 'Optional: Vorlage zur Vorausfüllung der Positionen auswählen', // <-- Добавлено
                        },
                        global: {
                            title: 'Globale Anwendungseinstellungen',
                            description: 'Hier können Sie Integrationen und Datenarchivierungsregeln verwalten.',
                        },
                        kb: {
                            title: 'Wissensdatenbank',
                            description: 'Fügen Sie neue Einträge zur Wissensdatenbank hinzu. Diese stehen dann in Vorlagen zur Verfügung.',
                            addItem: 'Eintrag hinzufügen',
                            modalTitle: 'Zur Wissensdatenbank hinzufügen',
                            categoryLabel: 'Kategorie',
                            categoryMsg: 'Bitte wählen oder erstellen Sie eine Kategorie!',
                            categoryPlaceholder: 'Wählen oder tippen Sie eine neue Kategorie',
                            itemLabel: 'Eintragstext',
                            itemMsg: 'Bitte geben Sie den Text des Eintrags ein!',
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