// src/i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

i18n
    .use(initReactI18next)
    .init({
        resources: {
            en: {
                translation: {
                    common: { cancel: 'Cancel', createOk: 'Create', locale: 'en-US', yes: 'Yes', no: 'No' },
                    /* ---------- MENU ---------- */
                    menu: {
                        projects: 'Projects',
                        users: 'Users',
                        templates: 'Templates',
                        archive: 'Archive',
                        dashboard: 'Dashboard',
                        profile: 'Profile',
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
                        action: 'Actions',
                    },
                    /* ---------- DASHBOARD ---------- */
                    dashboard: {
                        charts: {
                            pieTitle: 'Ticket Status Overview',
                            treeTitle: 'Status Proportions',
                            noData: 'No status data available.'
                        }
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
                        forgotModalTitle: 'Reset Password Request',
                        forgotDesc: 'Please enter your username. The administrator will be notified.',
                        submitRequest: 'Send Request',
                        requestSent: 'Request sent successfully',
                    },
                    /* ---------- GENERAL & PROJECTS ---------- */
                    logout: 'Logout',
                    projects: {
                        allProjects: 'All Projects',
                        myProjects: 'My Projects',
                        create: 'Create Project',
                        manager: 'Manager',
                        notFound: 'Project not found',
                        overdue: 'Overdue',
                        deleteConfirmTitle: 'Delete the project?',
                        deleteConfirmDesc: 'Are you sure you want to delete this project?',
                        detail: {
                            addInspectionItem: 'Add inspection item',
                            exportPDF: 'Export to PDF',
                            history: 'History',
                            changeSettings: 'Change project status',
                            deleteItemConfirm: 'Delete this item?',
                        },
                        status: {
                            in_progress: 'In progress',
                            finished: 'Finished',
                            on_hold: 'On hold',
                        },
                        filters: {
                            search: 'Search...',
                            kundeAll: 'All customers',
                            statusAll: 'All statuses',
                            reset: 'Reset filters',
                        },
                        form: {
                            name: 'Project name',
                            nameMsg: 'Please enter the project name!',
                            kunde: 'Customer',
                            kundeMsg: 'Please enter the customer!',
                            manager: 'Manager',
                            managerMsg: 'Please enter the manager!',
                            status: 'Status',
                            statusMsg: 'Please select the status!',
                            basePlannedDate: 'Base Planned Date for Template Items',
                            basePlannedDateMsg: 'Please select a base planned date',
                            projectId: 'Project Name/Number/ID',
                            projectIdMsg: 'Please enter project ID',
                            quarter: 'Quarter',
                            quarterMsg: 'Select quarter',
                            year: 'Year',
                            yearMsg: 'Enter year',
                            department: 'Department',
                            departmentMsg: 'Please enter department',
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
                        },
                        resetRequested: 'Password reset requested!',
                    },
                    /* ---------- PROFILE PAGE ---------- */
                    profile: {
                        title: 'My Profile',
                        name: 'Name',
                        password: 'New Password',
                        confirmPassword: 'Confirm Password',
                        update: 'Update Profile',
                        success: 'Profile updated successfully',
                        mismatch: 'Passwords do not match!',
                    },
                    /* ---------- TEMPLATES PAGE ---------- */
                    settingsPage: {
                        title: 'Templates',
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
                            select: 'Optional: Select a template to pre-fill items',
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
                            manageItems: 'Manage Inspection Items',
                            addNewItem: 'Add New Item',
                            editItem: 'Edit Item',
                            itemDeleted: 'Item deleted',
                            itemUpdated: 'Item updated',
                            itemCreated: 'Item created',
                            failedToSave: 'Failed to save item',
                            failedToDelete: 'Failed to delete item',
                            deleteItemConfirm: 'Delete this item?',
                        }
                    },
                    /* ---------- HISTORY EVENTS ---------- */
                    historyEvent: {
                        project_created: 'Project Created',
                        project_status_updated: 'Project Status Updated',
                        project_manager_updated: 'Manager Updated',
                        item_added: 'Item Added',
                        item_deleted: 'Item Deleted',
                        item_status_updated: 'Item Status Updated',
                        file_uploaded: 'File Uploaded'
                    },
                    goToProject: 'Go to project',
                },
            },
            de: {
                translation: {
                    common: { cancel: 'Abbrechen', createOk: 'Erstellen', locale: 'de-DE', yes: 'Ja', no: 'Nein' },
                    /* ---------- MENU ---------- */
                    menu: {
                        projects: 'Projekte',
                        users: 'Benutzer',
                        templates: 'Vorlagen',
                        archive: 'Archiv',
                        dashboard: 'Dashboard',
                        profile: 'Profil',
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
                        action: 'Aktionen',
                    },
                    /* ---------- ITEM STATUSES ---------- */
                    itemStatus: {
                        approved: 'Genehmigt',
                        rejected: 'Abgelehnt',
                        pending: 'Wartet auf Genehmigung',
                        open: 'Offen',
                        overdue: 'Überfällige Aufgaben',
                    },
                    /* ---------- DASHBOARD ---------- */
                    dashboard: {
                        charts: {
                            pieTitle: 'Ticket-Statusübersicht',
                            treeTitle: 'Status-Proportionen',
                            noData: 'Keine Statusdaten verfügbar.'
                        }
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
                        forgotModalTitle: 'Passwort zurücksetzen',
                        forgotDesc: 'Bitte geben Sie Ihren Benutzernamen ein. Der Administrator wird benachrichtigt.',
                        submitRequest: 'Anfrage senden',
                        requestSent: 'Anfrage erfolgreich gesendet',
                    },
                    /* ---------- GENERAL & PROJECTS ---------- */
                    logout: 'Abmelden',
                    projects: {
                        allProjects: 'Alle Projekte',
                        myProjects: 'Meine Projekte',
                        create: 'Projekt erstellen',
                        manager: 'Manager',
                        notFound: 'Projekt nicht gefunden',
                        overdue: 'Überfällig',
                        deleteConfirmTitle: 'Projekt löschen?',
                        deleteConfirmDesc: 'Sind Sie sicher, dass Sie dieses Projekt löschen möchten?',
                        detail: {
                            addInspectionItem: 'Prüfgegenstand hinzufügen',
                            exportPDF: 'PDF exportieren',
                            history: 'Historie',
                            changeSettings: 'Projektstatus ändern',
                            deleteItemConfirm: 'Diesen Eintrag löschen?',
                        },
                        status: {
                            in_progress: 'In Bearbeitung',
                            finished: 'Abgeschlossen',
                            on_hold: 'Pausiert',
                        },
                        filters: {
                            search: 'Suchen...',
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
                            projectId: 'Projekt Name/Nummer/ID',
                            projectIdMsg: 'Bitte geben Sie eine Projekt-ID ein',
                            quarter: 'Quartal',
                            quarterMsg: 'Bitte Quartal wählen',
                            year: 'Jahr',
                            yearMsg: 'Bitte Jahr eingeben',
                            department: 'Abteilung',
                            departmentMsg: 'Bitte Abteilung eingeben',
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
                        },
                        resetRequested: 'Passwort-Reset angefordert!',
                    },
                    /* ---------- PROFILE PAGE ---------- */
                    profile: {
                        title: 'Mein Profil',
                        name: 'Name',
                        password: 'Neues Passwort',
                        confirmPassword: 'Passwort bestätigen',
                        update: 'Profil aktualisieren',
                        success: 'Profil erfolgreich aktualisiert',
                        mismatch: 'Passwörter stimmen nicht überein!',
                    },
                    /* ---------- TEMPLATES PAGE ---------- */
                    settingsPage: {
                        title: 'Vorlagen',
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
                            select: 'Optional: Vorlage zur Vorausfüllung der Positionen auswählen',
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
                            manageItems: 'Prüfpositionen verwalten',
                            addNewItem: 'Neuen Eintrag hinzufügen',
                            editItem: 'Eintrag bearbeiten',
                            itemDeleted: 'Eintrag gelöscht',
                            itemUpdated: 'Eintrag aktualisiert',
                            itemCreated: 'Eintrag erstellt',
                            failedToSave: 'Fehler beim Speichern des Eintrags',
                            failedToDelete: 'Fehler beim Löschen des Eintrags',
                            deleteItemConfirm: 'Diesen Eintrag löschen?',
                        }
                    },
                    /* ---------- HISTORY EVENTS ---------- */
                    historyEvent: {
                        project_created: 'Projekt erstellt',
                        project_status_updated: 'Projektstatus geändert',
                        project_manager_updated: 'Manager geändert',
                        item_added: 'Eintrag hinzugefügt',
                        item_deleted: 'Eintrag gelöscht',
                        item_status_updated: 'Eintrag-Status geändert',
                        file_uploaded: 'Datei hochgeladen'
                    },
                    goToProject: 'Zum Projekt',
                },
            },
        },
        lng: localStorage.getItem('i18nextLng') || 'de',
        fallbackLng: 'en',
        interpolation: { escapeValue: false },
    });

i18n.on('languageChanged', (lng) => {
    localStorage.setItem('i18nextLng', lng);
});

export default i18n;