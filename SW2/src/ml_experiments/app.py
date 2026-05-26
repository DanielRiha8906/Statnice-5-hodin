"""Grafické uživatelské rozhraní aplikace.

GUI je vytvořené v Tkinteru, protože je součástí standardní knihovny Pythonu.
To znamená, že aplikace je snadno přenositelná a nepotřebuje externí GUI
framework. Pro školní zadání je to velmi rozumná volba.
"""

from __future__ import annotations

import tkinter as tk
from tkinter import messagebox, ttk

from ml_experiments.models import MLModel
from ml_experiments.service import ExperimentService, ValidationError


class MLExperimentApp(tk.Tk):
    """Hlavní okno aplikace."""

    def __init__(self, service: ExperimentService) -> None:
        """Inicializuje okno a vytvoří všechny jeho části."""

        super().__init__()
        self.service = service

        self.title("Správa ML experimentů")
        self.geometry("1250x760")
        self.minsize(1100, 700)

        # V GUI si držíme jednoduché mapy `název -> objekt`, aby uživatel vybíral
        # čitelné názvy, ale aplikace přitom měla k dispozici jejich databázová ID.
        self.experiment_map: dict[str, int] = {}
        self.model_map: dict[str, int] = {}

        self._build_layout()
        self.refresh_all_data()

    def _build_layout(self) -> None:
        """Sestaví rozložení hlavního okna."""

        self.columnconfigure(0, weight=1)
        self.rowconfigure(0, weight=1)

        notebook = ttk.Notebook(self)
        notebook.grid(row=0, column=0, sticky="nsew", padx=12, pady=12)

        self.experiment_tab = ttk.Frame(notebook, padding=12)
        self.model_tab = ttk.Frame(notebook, padding=12)
        self.assignment_tab = ttk.Frame(notebook, padding=12)

        notebook.add(self.experiment_tab, text="Experimenty")
        notebook.add(self.model_tab, text="Modely")
        notebook.add(self.assignment_tab, text="Výsledky v experimentech")

        self._build_experiment_tab()
        self._build_model_tab()
        self._build_assignment_tab()

    def _build_experiment_tab(self) -> None:
        """Vytvoří formulář a seznam experimentů."""

        self.experiment_tab.columnconfigure(0, weight=1)
        self.experiment_tab.columnconfigure(1, weight=1)
        self.experiment_tab.rowconfigure(1, weight=1)

        form_frame = ttk.LabelFrame(
            self.experiment_tab,
            text="Založení experimentu",
            padding=12,
        )
        form_frame.grid(row=0, column=0, sticky="nsew", padx=(0, 8), pady=(0, 8))

        ttk.Label(form_frame, text="Název experimentu:").grid(
            row=0, column=0, sticky="w", pady=(0, 6)
        )
        self.experiment_name_entry = ttk.Entry(form_frame, width=45)
        self.experiment_name_entry.grid(row=1, column=0, sticky="ew", pady=(0, 10))

        ttk.Label(form_frame, text="Popis experimentu:").grid(
            row=2, column=0, sticky="w", pady=(0, 6)
        )
        self.experiment_description_text = tk.Text(form_frame, width=50, height=10)
        self.experiment_description_text.grid(
            row=3, column=0, sticky="ew", pady=(0, 10)
        )

        ttk.Button(
            form_frame,
            text="Uložit experiment",
            command=self._handle_create_experiment,
        ).grid(row=4, column=0, sticky="ew")

        form_frame.columnconfigure(0, weight=1)

        list_frame = ttk.LabelFrame(
            self.experiment_tab,
            text="Uložené experimenty",
            padding=12,
        )
        list_frame.grid(row=0, column=1, rowspan=2, sticky="nsew", pady=(0, 8))
        list_frame.columnconfigure(0, weight=1)
        list_frame.rowconfigure(0, weight=1)

        self.experiment_tree = ttk.Treeview(
            list_frame,
            columns=("name", "description"),
            show="headings",
            height=18,
        )
        self.experiment_tree.heading("name", text="Název")
        self.experiment_tree.heading("description", text="Popis")
        self.experiment_tree.column("name", width=180, anchor="w")
        self.experiment_tree.column("description", width=420, anchor="w")
        self.experiment_tree.grid(row=0, column=0, sticky="nsew")

        scrollbar = ttk.Scrollbar(
            list_frame, orient="vertical", command=self.experiment_tree.yview
        )
        self.experiment_tree.configure(yscrollcommand=scrollbar.set)
        scrollbar.grid(row=0, column=1, sticky="ns")

    def _build_model_tab(self) -> None:
        """Vytvoří formulář pro modely a jejich přehled."""

        self.model_tab.columnconfigure(0, weight=1)
        self.model_tab.columnconfigure(1, weight=1)
        self.model_tab.rowconfigure(1, weight=1)

        form_frame = ttk.LabelFrame(
            self.model_tab,
            text="Definice modelu",
            padding=12,
        )
        form_frame.grid(row=0, column=0, sticky="nsew", padx=(0, 8), pady=(0, 8))
        form_frame.columnconfigure(1, weight=1)

        ttk.Label(form_frame, text="Typ modelu:").grid(
            row=0, column=0, sticky="w", pady=(0, 6)
        )
        self.model_type_var = tk.StringVar(value="RandomForestClassifier")
        self.model_type_combo = ttk.Combobox(
            form_frame,
            textvariable=self.model_type_var,
            values=list(self.service.SUPPORTED_MODELS.keys()),
            state="readonly",
        )
        self.model_type_combo.grid(row=0, column=1, sticky="ew", pady=(0, 6))
        self.model_type_combo.bind("<<ComboboxSelected>>", self._update_parameter_form)

        ttk.Label(form_frame, text="Název modelu:").grid(
            row=1, column=0, sticky="w", pady=(0, 6)
        )
        self.model_name_entry = ttk.Entry(form_frame)
        self.model_name_entry.grid(row=1, column=1, sticky="ew", pady=(0, 6))

        ttk.Label(form_frame, text="Popis modelu:").grid(
            row=2, column=0, sticky="nw", pady=(0, 6)
        )
        self.model_description_text = tk.Text(form_frame, width=40, height=6)
        self.model_description_text.grid(row=2, column=1, sticky="ew", pady=(0, 6))

        self.parameter_entries: dict[str, ttk.Entry] = {}
        self.parameter_help_labels: dict[str, ttk.Label] = {}
        self.parameter_frame = ttk.LabelFrame(
            form_frame,
            text="Konfigurace modelu",
            padding=10,
        )
        self.parameter_frame.grid(row=3, column=0, columnspan=2, sticky="ew", pady=8)
        self.parameter_frame.columnconfigure(1, weight=1)

        ttk.Button(
            form_frame,
            text="Uložit model",
            command=self._handle_create_model,
        ).grid(row=4, column=0, columnspan=2, sticky="ew", pady=(6, 0))

        list_frame = ttk.LabelFrame(
            self.model_tab,
            text="Uložené modely",
            padding=12,
        )
        list_frame.grid(row=0, column=1, rowspan=2, sticky="nsew", pady=(0, 8))
        list_frame.columnconfigure(0, weight=1)
        list_frame.rowconfigure(0, weight=1)

        self.model_tree = ttk.Treeview(
            list_frame,
            columns=("type", "name", "description", "parameters"),
            show="headings",
            height=18,
        )
        self.model_tree.heading("type", text="Typ")
        self.model_tree.heading("name", text="Jméno")
        self.model_tree.heading("description", text="Popis")
        self.model_tree.heading("parameters", text="Parametry")
        self.model_tree.column("type", width=160, anchor="w")
        self.model_tree.column("name", width=150, anchor="w")
        self.model_tree.column("description", width=220, anchor="w")
        self.model_tree.column("parameters", width=260, anchor="w")
        self.model_tree.grid(row=0, column=0, sticky="nsew")

        scrollbar = ttk.Scrollbar(
            list_frame, orient="vertical", command=self.model_tree.yview
        )
        self.model_tree.configure(yscrollcommand=scrollbar.set)
        scrollbar.grid(row=0, column=1, sticky="ns")

        self._update_parameter_form()

    def _build_assignment_tab(self) -> None:
        """Vytvoří záložku pro přiřazení modelu do experimentu a pro filtrování."""

        self.assignment_tab.columnconfigure(0, weight=1)
        self.assignment_tab.rowconfigure(1, weight=1)

        top_frame = ttk.LabelFrame(
            self.assignment_tab,
            text="Přiřazení modelu do experimentu",
            padding=12,
        )
        top_frame.grid(row=0, column=0, sticky="ew", pady=(0, 8))

        ttk.Label(top_frame, text="Experiment:").grid(row=0, column=0, sticky="w")
        self.assignment_experiment_var = tk.StringVar()
        self.assignment_experiment_combo = ttk.Combobox(
            top_frame,
            textvariable=self.assignment_experiment_var,
            state="readonly",
            width=30,
        )
        self.assignment_experiment_combo.grid(
            row=1, column=0, sticky="ew", padx=(0, 8), pady=(4, 8)
        )
        self.assignment_experiment_combo.bind(
            "<<ComboboxSelected>>", self._handle_experiment_selection_changed
        )

        ttk.Label(top_frame, text="Model:").grid(row=0, column=1, sticky="w")
        self.assignment_model_var = tk.StringVar()
        self.assignment_model_combo = ttk.Combobox(
            top_frame,
            textvariable=self.assignment_model_var,
            state="readonly",
            width=30,
        )
        self.assignment_model_combo.grid(
            row=1, column=1, sticky="ew", padx=(0, 8), pady=(4, 8)
        )

        ttk.Label(top_frame, text="Výsledek:").grid(row=0, column=2, sticky="w")
        self.result_value_entry = ttk.Entry(top_frame, width=18)
        self.result_value_entry.grid(row=1, column=2, sticky="ew", padx=(0, 8), pady=(4, 8))

        ttk.Button(
            top_frame,
            text="Přiřadit model a uložit výsledek",
            command=self._handle_assign_model,
        ).grid(row=1, column=3, sticky="ew", pady=(4, 8))

        top_frame.columnconfigure(0, weight=1)
        top_frame.columnconfigure(1, weight=1)
        top_frame.columnconfigure(2, weight=0)
        top_frame.columnconfigure(3, weight=0)

        filter_frame = ttk.LabelFrame(
            self.assignment_tab,
            text="Filtrování a řazení v rámci experimentu",
            padding=12,
        )
        filter_frame.grid(row=1, column=0, sticky="nsew")
        filter_frame.columnconfigure(0, weight=1)
        filter_frame.rowconfigure(1, weight=1)

        controls_frame = ttk.Frame(filter_frame)
        controls_frame.grid(row=0, column=0, sticky="ew", pady=(0, 8))

        ttk.Label(controls_frame, text="Filtr typu modelu:").grid(
            row=0, column=0, sticky="w", padx=(0, 6)
        )
        self.filter_model_type_var = tk.StringVar(value="Vše")
        self.filter_model_type_combo = ttk.Combobox(
            controls_frame,
            textvariable=self.filter_model_type_var,
            state="readonly",
            width=24,
        )
        self.filter_model_type_combo.grid(row=0, column=1, sticky="w", padx=(0, 10))
        self.filter_model_type_combo.bind(
            "<<ComboboxSelected>>", self._refresh_results_table
        )

        ttk.Label(controls_frame, text="Řazení výsledků:").grid(
            row=0, column=2, sticky="w", padx=(0, 6)
        )
        self.sort_order_var = tk.StringVar(value="Sestupně")
        self.sort_order_combo = ttk.Combobox(
            controls_frame,
            textvariable=self.sort_order_var,
            values=["Sestupně", "Vzestupně"],
            state="readonly",
            width=18,
        )
        self.sort_order_combo.grid(row=0, column=3, sticky="w", padx=(0, 10))
        self.sort_order_combo.bind("<<ComboboxSelected>>", self._refresh_results_table)

        ttk.Button(
            controls_frame,
            text="Obnovit tabulku",
            command=self._refresh_results_table,
        ).grid(row=0, column=4, sticky="w")

        self.results_tree = ttk.Treeview(
            filter_frame,
            columns=("model_name", "model_type", "result", "parameters", "description"),
            show="headings",
            height=18,
        )
        self.results_tree.heading("model_name", text="Model")
        self.results_tree.heading("model_type", text="Typ")
        self.results_tree.heading("result", text="Výsledek")
        self.results_tree.heading("parameters", text="Parametry")
        self.results_tree.heading("description", text="Popis")
        self.results_tree.column("model_name", width=180, anchor="w")
        self.results_tree.column("model_type", width=160, anchor="w")
        self.results_tree.column("result", width=100, anchor="center")
        self.results_tree.column("parameters", width=280, anchor="w")
        self.results_tree.column("description", width=350, anchor="w")
        self.results_tree.grid(row=1, column=0, sticky="nsew")

        scrollbar = ttk.Scrollbar(
            filter_frame, orient="vertical", command=self.results_tree.yview
        )
        self.results_tree.configure(yscrollcommand=scrollbar.set)
        scrollbar.grid(row=1, column=1, sticky="ns")

    def _update_parameter_form(self, _event: object | None = None) -> None:
        """Překreslí formulář parametrů podle vybraného typu modelu."""

        for widget in self.parameter_frame.winfo_children():
            widget.destroy()

        self.parameter_entries.clear()
        self.parameter_help_labels.clear()

        selected_type = self.model_type_var.get()
        parameters = self.service.SUPPORTED_MODELS[selected_type]

        for row_index, (parameter_name, parameter_help) in enumerate(parameters):
            ttk.Label(self.parameter_frame, text=f"{parameter_name}:").grid(
                row=row_index, column=0, sticky="w", pady=4
            )

            entry = ttk.Entry(self.parameter_frame)
            entry.grid(row=row_index, column=1, sticky="ew", pady=4, padx=(0, 8))
            self.parameter_entries[parameter_name] = entry

            help_label = ttk.Label(self.parameter_frame, text=parameter_help)
            help_label.grid(row=row_index, column=2, sticky="w", pady=4)
            self.parameter_help_labels[parameter_name] = help_label

    def _handle_create_experiment(self) -> None:
        """Zpracuje kliknutí na tlačítko pro založení experimentu."""

        try:
            self.service.create_experiment(
                name=self.experiment_name_entry.get(),
                description=self.experiment_description_text.get("1.0", "end"),
            )
        except ValidationError as error:
            messagebox.showerror("Chyba validace", str(error))
            return

        self.experiment_name_entry.delete(0, tk.END)
        self.experiment_description_text.delete("1.0", tk.END)
        self.refresh_all_data()
        messagebox.showinfo("Hotovo", "Experiment byl úspěšně uložen.")

    def _handle_create_model(self) -> None:
        """Zpracuje kliknutí na tlačítko pro založení modelu."""

        parameter_values = {
            parameter_name: entry.get()
            for parameter_name, entry in self.parameter_entries.items()
        }

        try:
            self.service.create_model(
                model_type=self.model_type_var.get(),
                name=self.model_name_entry.get(),
                description=self.model_description_text.get("1.0", "end"),
                parameter_values=parameter_values,
            )
        except ValidationError as error:
            messagebox.showerror("Chyba validace", str(error))
            return

        self.model_name_entry.delete(0, tk.END)
        self.model_description_text.delete("1.0", tk.END)
        for entry in self.parameter_entries.values():
            entry.delete(0, tk.END)

        self.refresh_all_data()
        messagebox.showinfo("Hotovo", "Model byl úspěšně uložen.")

    def _handle_assign_model(self) -> None:
        """Zpracuje uložení výsledku modelu v experimentu."""

        experiment_id = self.experiment_map.get(self.assignment_experiment_var.get())
        model_id = self.model_map.get(self.assignment_model_var.get())

        try:
            self.service.assign_model_to_experiment(
                experiment_id=experiment_id,
                model_id=model_id,
                result_value_text=self.result_value_entry.get(),
            )
        except ValidationError as error:
            messagebox.showerror("Chyba validace", str(error))
            return

        self.result_value_entry.delete(0, tk.END)
        self._refresh_results_table()
        messagebox.showinfo("Hotovo", "Výsledek modelu byl uložen do experimentu.")

    def _handle_experiment_selection_changed(self, _event: object | None = None) -> None:
        """Po změně experimentu obnoví tabulku výsledků."""

        self._refresh_results_table()

    def refresh_all_data(self) -> None:
        """Obnoví všechny seznamy a tabulky v okně.

        Tato metoda je praktická po každém úspěšném uložení. Nemusíme ručně
        synchronizovat několik různých comboboxů a treeview komponent.
        """

        self._refresh_experiment_tree()
        self._refresh_model_tree()
        self._refresh_experiment_comboboxes()
        self._refresh_model_combobox()
        self._refresh_filter_combobox()
        self._refresh_results_table()

    def _refresh_experiment_tree(self) -> None:
        """Načte experimenty do přehledu."""

        for item in self.experiment_tree.get_children():
            self.experiment_tree.delete(item)

        for experiment in self.service.list_experiments():
            self.experiment_tree.insert(
                "",
                tk.END,
                values=(experiment.name, experiment.description),
            )

    def _refresh_model_tree(self) -> None:
        """Načte modely do přehledu."""

        for item in self.model_tree.get_children():
            self.model_tree.delete(item)

        for model in self.service.list_models():
            parameters_text = ", ".join(
                f"{parameter.name}={parameter.value}"
                for parameter in model.parameters
            )
            self.model_tree.insert(
                "",
                tk.END,
                values=(
                    model.model_type,
                    model.name,
                    model.description,
                    parameters_text,
                ),
            )

    def _refresh_experiment_comboboxes(self) -> None:
        """Naplní comboboxy seznamem experimentů."""

        experiments = self.service.list_experiments()
        self.experiment_map = {experiment.name: experiment.id for experiment in experiments}
        experiment_names = list(self.experiment_map.keys())

        self.assignment_experiment_combo["values"] = experiment_names

        if experiment_names and self.assignment_experiment_var.get() not in self.experiment_map:
            self.assignment_experiment_var.set(experiment_names[0])

    def _refresh_model_combobox(self) -> None:
        """Naplní combobox pro výběr modelu."""

        models = self.service.list_models()
        self.model_map = {self._format_model_label(model): model.id for model in models}
        model_labels = list(self.model_map.keys())

        self.assignment_model_combo["values"] = model_labels

        if model_labels and self.assignment_model_var.get() not in self.model_map:
            self.assignment_model_var.set(model_labels[0])

    def _refresh_filter_combobox(self) -> None:
        """Naplní combobox pro filtr typů modelů."""

        filter_values = ["Vše", *self.service.list_available_model_types()]
        self.filter_model_type_combo["values"] = filter_values

        if self.filter_model_type_var.get() not in filter_values:
            self.filter_model_type_var.set("Vše")

    def _refresh_results_table(self, _event: object | None = None) -> None:
        """Načte výsledky do tabulky podle aktivních filtrů."""

        for item in self.results_tree.get_children():
            self.results_tree.delete(item)

        experiment_id = self.experiment_map.get(self.assignment_experiment_var.get())
        model_type = self.filter_model_type_var.get()
        sort_descending = self.sort_order_var.get() == "Sestupně"

        results = self.service.list_results_for_experiment(
            experiment_id=experiment_id,
            model_type=model_type,
            sort_descending=sort_descending,
        )

        for result in results:
            self.results_tree.insert(
                "",
                tk.END,
                values=(
                    result.model_name,
                    result.model_type,
                    f"{result.result_value:.4f}",
                    result.parameters_text,
                    result.model_description,
                ),
            )

    @staticmethod
    def _format_model_label(model: MLModel) -> str:
        """Vrátí čitelný štítek modelu do comboboxu."""

        return f"{model.name} ({model.model_type})"
