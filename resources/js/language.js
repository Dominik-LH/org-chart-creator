function changeLanguage(lang) {
    if (!translations[lang]) return;

    // Sprache speichern
    localStorage.setItem("language", lang);

    // Alle Elemente mit data-i18n aktualisieren
    document.querySelectorAll("[data-i18n]").forEach(el => {
        const key = el.getAttribute("data-i18n");
        if (translations[lang][key]) {
            if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
                el.placeholder = translations[lang][key]; // Placeholder für Inputs
            } else {
                el.textContent = translations[lang][key]; // Normale Texte
            }
        }
    });
}

function toggleLanguage() {
    let currLang = localStorage.getItem("language");
    if (currLang == 'en') {
        changeLanguage('de')
    } else {
        changeLanguage('en')
    }
    
}

const translations = { 
    en: {
        // header
        import_csv: "Import CSV",
        export: "Export",
        // menu header
        file: "File",
        edit: "Edit",
        settings: "Settings",
        help: "Help",
        all_changes_saved: "All changes saved",
        unsaved_changes: "Unsaved changes. Click here to save.",
        saving: "Saving...",
        // file menu
        new: "New",
        open: "Open",
        open_sc: "(ctrl + o)",
        save: "Save",
        save_sc: "(ctrl + s)",
        save_as: "Save as",
        export_as_PDF: "Export as PDF",
        export_as_PDF_sc: "(ctrl + p)",
        export_as_CSV: "Export as CSV",
        //edit menu
        undo: "Undo",
        undo_sc: "(ctrl + z)",
        redo: "Redo",
        redo_sc: "(ctrl + y)",
        // settings menu
        dark_theme: "Dark Theme",
        autosave: "Autosave",
        hide_names: "Hide names *",
        hide_placeholder: "Hide placeholder *",
        // help menu
        user_guid: "User Guide",
        documentation: "Documentation",
        // import popup
        import_menu: "Import Menu",
        import_menu_text: "By importing a CSV file, the organizational chart can be created automatically. Note that the CSV file must have the following columns: Bezeichnung, Leiter, Name, Level.",
        import_menu_file_label: "Select a CSV file to import",
        import_menu_primary: "Import",
        import_menu_secondary: "Cancel",
        // export menu 
        export_menu: "Export Menu",
        export_menu_title_label: "Title of the Organizational Chart",
        export_menu_names_label: "Export with Names",
        export_menu_primary: "Export",
        export_menu_secondary: "Cancel",
        // toolbar
        add_position: "Add position",
        down_connect: "Down connect",
        left_connect: "Left connect",
        add_page: "Add page",
        page_editor: "Page Editor",
        // page menu
        page_menu: "Page Editor",
        page_menu_text: "Move pages by dragging. Delete pages by hovering.",
        // page 
        title_placeholder: "add title by clicking here",
        subtitle_placeholder: "add subtitle by clicking here",
        // position 
        position_placeholder_text1: "Abbr -",
        position_placeholder_text2: " expl.",
        position_person_placeholder_text: "Responsible person",
        // position editor
        func_int: "func. int.",
        project: "project",
        // display messages
        select_positions_for_connect: "Select the positions you want to connect.",
        removing_connection: "Removing the connection.",
        changing_connection: "Changing the connection.",
        selection_cancel: "Selection cancelled.",
        nothing_to_undo: "Nothing to undo",
        nothing_to_redo: "Nothing to redo",
        error_file_access_denied: "Access to the recent file was denied. Please check permissions.",
        error_file_not_found: "The recent file was not found. It may have been moved or deleted.",
        confirm_override_text: "There are unsaved changes. If you continue, these changes will be lost. This action cannot be undone!",
        confirm_override_primary: "Continue",
        confirm_override_title: "Override current changes?",
        autosave_disabled: "Autosave is disabled",
        confirm_delete_page_text: "Do you want to delete the entire page with the positions?",
        confirm_delete_page_primary: "Delete",
        confirm_delete_page_title: "Delete Page",
        add_page_first: "Please add a page first",
        in_progress: "Some task is in progress. Are you sure you want to close?",
        import_error_message: "Please select a valid CSV file.",
        import_error_message_columns: "Columns not matching."
    },
    de: {
        // Header
        import_csv: "CSV importieren",
        export: "Exportieren",
        // Menü-Header
        file: "Datei",
        edit: "Bearbeiten",
        settings: "Einstellungen",
        help: "Hilfe",
        all_changes_saved: "Alle Änderungen gespeichert",
        unsaved_changes: "Ungespeicherte Änderungen. Hier klicken, um zu speichern.",
        saving: "Speichern...",
        // Datei-Menü
        new: "Neu",
        open: "Öffnen",
        open_sc: "(strg + o)",
        save: "Speichern",
        save_sc: "(strg + s)",
        save_as: "Speichern unter",
        export_as_PDF: "Als PDF exportieren",
        export_as_PDF_sc: "(strg + p)",
        export_as_CSV: "Als CSV exportieren",
        //edit menu
        undo: "Rückgängig machen",
        undo_sc: "(strg + z)",
        redo: "Wiederholen",
        redo_sc: "(strg + y)",
        // Einstellungsmenü
        dark_theme: "Dunkles Design",
        autosave: "Automatisches Speichern",
        hide_names: "Namen ausblenden *",
        hide_placeholder: "Platzhalter ausblenden *",
        // Hilfemenü
        user_guid: "Benutzerhandbuch",
        documentation: "Dokumentation",
        // Import-Popup
        import_menu: "Import Menü",
        import_menu_text: "Durch den Import einer CSV-Datei kann das Organigramm automatisch erstellt werden. Beachte, dass die CSV-Datei die folgenden Spalten enthalten muss: Bezeichnung, Leiter, Name, Level.",
        import_menu_file_label: "CSV-Datei zum Import auswählen",
        import_menu_primary: "Importieren",
        import_menu_secondary: "Abbrechen",
        // Export-Menü 
        export_menu: "Export Menü",
        export_menu_title_label: "Titel des Organigramms",
        export_menu_names_label: "Mit Namen exportieren",
        export_menu_primary: "Exportieren",
        export_menu_secondary: "Abbrechen",
        // Toolbar
        add_position: "Position hinzufügen",
        down_connect: "Nach unten verbinden",
        left_connect: "Nach links verbinden",
        add_page: "Seite hinzufügen",
        page_editor: "Seiten-Editor",
        // Seitenmenü
        page_menu: "Seiten-Editor",
        page_menu_text: "Seiten durch Ziehen verschieben. Seiten löschen durch Darüberfahren.",
        // Seite
        title_placeholder: "Titel durch Klicken hinzufügen",
        subtitle_placeholder: "Untertitel durch Klicken hinzufügen",
        // Position
        position_placeholder_text1: "Abk. -",
        position_placeholder_text2: " Erklärung",
        position_person_placeholder_text: "Verantwortliche Person",
        // Position-Editor
        func_int: "Funk. int.",
        project: "Projekt",
        // Anzeige-Nachrichten
        select_positions_for_connect: "Wähle die Positionen aus, die du verbinden möchtest.",
        removing_connection: "Verbindung wird entfernt.",
        changing_connection: "Verbindung wird geändert.",
        selection_cancel: "Auswahl abgebrochen.",
        nothing_to_undo: "Nichts zum Rückgängig machen vorhanden",
        nothing_to_redo: "Nichts zum Wiederholen vorhanden",
        error_file_access_denied: "Zugriff auf die letzte Datei wurde verweigert. Bitte überprüfe die Berechtigungen.",
        error_file_not_found: "Die letzte Datei wurde nicht gefunden. Sie wurde möglicherweise verschoben oder gelöscht.",
        confirm_override_text: "Es gibt ungespeicherte Änderungen. Wenn du fortfährst, gehen diese verloren. Diese Aktion kann nicht rückgängig gemacht werden!",
        confirm_override_primary: "Fortfahren",
        confirm_override_title: "Aktuelle Änderungen überschreiben?",
        autosave_disabled: "Automatisches Speichern ist deaktiviert",
        confirm_delete_page_text: "Möchtest du die gesamte Seite mit den Positionen löschen?",
        confirm_delete_page_primary: "Löschen",
        confirm_delete_page_title: "Seite löschen",
        add_page_first: "Bitte füge zuerst eine Seite hinzu",
        in_progress: "Eine Prozess ist am laufen. Möchten Sie sie wirklich schließen?",
        import_error_message: "Bitte wählen Sie eine gültige CSV-Datei aus.",
        import_error_message_columns: "Spalten stimmen nicht überein."
    }
};
