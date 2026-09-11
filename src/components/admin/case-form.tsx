import * as React from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { caseSchema, CaseFormValues } from "@/lib/cases.schema";
import { useQuery } from "@tanstack/react-query";
import { getMediaFiles } from "@/lib/media.functions";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Save, Loader2, Info, GripVertical } from "lucide-react";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";
import { Constants } from "@/integrations/supabase/types";

type CaseFormProps = {
  initialData?: Partial<CaseFormValues>;
  onSubmit: (data: CaseFormValues) => void;
  isSubmitting?: boolean;
};

const CATEGORIES = Constants.public.Enums.evidence_category;
const RELIABILITIES = Constants.public.Enums.evidence_reliability;
const IMPORTANCES = Constants.public.Enums.evidence_importance;

const toNumberOrNull = (v: any) => {
  if (v === "" || v === null || v === undefined) return null;
  const n = Number(v);
  return Number.isNaN(n) ? null : n;
};

export function CaseForm({ initialData, onSubmit, isSubmitting }: CaseFormProps) {
  const { data: mediaFiles } = useQuery({
    queryKey: ["mediaFiles"],
    queryFn: () => getMediaFiles(),
  });

  const form = useForm<CaseFormValues>({
    resolver: zodResolver(caseSchema),
    defaultValues: initialData || {
      number: 1,
      code: "AV-",
      title: "",
      difficulty: 1,
      is_final: false,
      points: 1,
      status: "draft",
      sort_order: 1,
      summary: "",
      description: "",
      central_question: "",
      algorithm_title: "",
      algorithm_description: "",
      algorithm_justification: "",
      reveal_justification: false,
      incident_data: {
        passengers: 0,
        pedestrians: 0,
        decision_time: 0,
        vehicle_speed: 0,
        survival_probability: 0,
        survival_probabilities: [],
        location: "",
        weather: "",
        visibility: "",
      },
      evidence: [],
      witnesses: [],
    },
  });

  const { handleSubmit, register, control, formState: { errors } } = form;
  const [activeTab, setActiveTab] = React.useState<"A" | "B" | "C" | "D" | "E">("A");

  const submitHandler = (values: CaseFormValues) => {
    console.log("SUBMITTING FORM VALUES:", JSON.stringify(values.witnesses, null, 2));
    onSubmit(values);
  };

  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* Sidebar Tabs */}
      <div className="w-full md:w-64 shrink-0 flex flex-col gap-1">
        <TabButton id="A" active={activeTab} onClick={setActiveTab} label="A. Identificação" />
        <TabButton id="B" active={activeTab} onClick={setActiveTab} label="B. Contexto" />
        <TabButton id="C" active={activeTab} onClick={setActiveTab} label="C. Decisão do Algoritmo" />
        <TabButton id="D" active={activeTab} onClick={setActiveTab} label="D. Dados do Incidente" />
        <TabButton id="E" active={activeTab} onClick={setActiveTab} label="E. Evidências e Testemunhas" />
        
        <div className="mt-8">
          <Button 
            className="w-full gap-2" 
            disabled={isSubmitting} 
            onClick={handleSubmit(submitHandler, (errs) => {
              console.error("Form validation errors:", errs);
              alert("Erro de validação! Verifique os campos obrigatórios nas abas.");
            })}
          >
            {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            Salvar Caso
          </Button>
          {Object.keys(errors).length > 0 && (
            <p className="mt-3 text-xs text-destructive text-center">Existem erros de validação nas abas.</p>
          )}
        </div>
      </div>

      {/* Form Content */}
      <div className="flex-1 min-w-0 bg-card rounded-md border p-6">
        <form onSubmit={handleSubmit(submitHandler, (errs) => {
          console.error("Form validation errors:", errs);
          alert("Erro de validação! Verifique os campos obrigatórios nas abas.");
        })}>
          
          {/* TAB A: Identificação */}
          <div className={cn("space-y-6", activeTab !== "A" && "hidden")}>
            <h2 className="text-lg font-medium border-b pb-2 mb-4">Identificação Básica</h2>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Número">
                <Input type="number" {...register("number", { valueAsNumber: true })} />
                <Error msg={errors.number?.message} />
              </Field>
              <Field label="Código">
                <Input {...register("code")} placeholder="AV-001" />
                <Error msg={errors.code?.message} />
              </Field>
            </div>
            <Field label="Título">
              <Input {...register("title")} placeholder="Ex: O Desvio" />
              <Error msg={errors.title?.message} />
            </Field>
            <Field label="Subtítulo">
              <Input {...register("subtitle")} placeholder="Ex: Passageiros vs. Pedestres" />
            </Field>
            <div className="grid grid-cols-3 gap-4">
              <Field label="Dificuldade (1-5)">
                <Input type="number" min="1" max="5" {...register("difficulty", { valueAsNumber: true })} />
              </Field>
              <Field label="Pontos">
                <Input type="number" {...register("points", { valueAsNumber: true })} />
              </Field>
              <Field label="Caso Final">
                <div className="flex items-center h-10">
                  <input type="checkbox" {...register("is_final")} className="size-4" />
                  <span className="ml-2 text-sm">Este é o último caso da sessão</span>
                </div>
              </Field>
            </div>
          </div>

          {/* TAB B: Contexto */}
          <div className={cn("space-y-6", activeTab !== "B" && "hidden")}>
            <h2 className="text-lg font-medium border-b pb-2 mb-4">Contexto e Narrativa</h2>
            <Field label="Resumo (Curto)">
              <Textarea {...register("summary")} rows={3} placeholder="Aparece no card da home..." />
              <Error msg={errors.summary?.message} />
            </Field>
            <Field label="Descrição Longa">
              <Textarea {...register("description")} rows={5} placeholder="Descrição completa do incidente..." />
              <Error msg={errors.description?.message} />
            </Field>
            <Field label="Questão Central">
              <Textarea {...register("central_question")} rows={2} placeholder="Ex: A decisão do algoritmo foi justificável?" />
              <Error msg={errors.central_question?.message} />
            </Field>
          </div>

          {/* TAB C: Decisão */}
          <div className={cn("space-y-6", activeTab !== "C" && "hidden")}>
            <h2 className="text-lg font-medium border-b pb-2 mb-4">Decisão do Algoritmo</h2>
            <Field label="Título da Decisão">
              <Input {...register("algorithm_title")} placeholder="Ex: PROTEGER OS PASSAGEIROS" />
              <Error msg={errors.algorithm_title?.message} />
            </Field>
            <Field label="Descrição da Decisão">
              <Textarea {...register("algorithm_description")} rows={3} placeholder="O sistema decidiu manter a trajetória..." />
              <Error msg={errors.algorithm_description?.message} />
            </Field>
            <Field label="Justificativa Técnica">
              <Textarea {...register("algorithm_justification")} rows={3} placeholder="O modelo calculou 85% de chance de sobrevivência..." />
            </Field>
            <Field label="Revelar Justificativa">
              <div className="flex items-center h-10">
                <input type="checkbox" {...register("reveal_justification")} className="size-4" />
                <span className="ml-2 text-sm">Mostrar a justificativa técnica aos alunos na fase final</span>
              </div>
            </Field>
          </div>

          {/* TAB D: Dados do Incidente */}
          <div className={cn("space-y-6", activeTab !== "D" && "hidden")}>
            <h2 className="text-lg font-medium border-b pb-2 mb-4">Dados do Incidente</h2>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Passageiros">
                <Input type="number" {...register("incident_data.passengers", { setValueAs: toNumberOrNull })} />
              </Field>
              <Field label="Pedestres">
                <Input type="number" {...register("incident_data.pedestrians", { setValueAs: toNumberOrNull })} />
              </Field>
              <Field label="Tempo de Decisão (s)">
                <Input type="number" step="0.1" {...register("incident_data.decision_time", { setValueAs: toNumberOrNull })} />
              </Field>
              <Field label="Velocidade (km/h)">
                <Input type="number" {...register("incident_data.vehicle_speed", { setValueAs: toNumberOrNull })} />
              </Field>
              <Field label="Local">
                <Input {...register("incident_data.location")} placeholder="Ex: Avenida urbana" />
              </Field>
              <Field label="Clima">
                <Input {...register("incident_data.weather")} placeholder="Ex: Chuva intensa" />
              </Field>
              <Field label="Visibilidade">
                <Input {...register("incident_data.visibility")} placeholder="Ex: Parcial" />
              </Field>
            </div>
            
            <div className="pt-4 border-t">
              <h3 className="text-sm font-medium mb-4">Probabilidades de Sobrevivência</h3>
              <SurvivalProbabilitiesList control={control} register={register} />
            </div>
          </div>

          {/* TAB E: Evidências e Testemunhas */}
          <div className={cn("space-y-8", activeTab !== "E" && "hidden")}>
            
            {/* EVIDENCE SECTION */}
            <div>
              <div className="flex items-center justify-between border-b pb-2 mb-4">
                <h2 className="text-lg font-medium">Evidências Iniciais</h2>
              </div>
              <EvidenceList control={control} register={register} errors={errors} mediaFiles={mediaFiles} />
            </div>

            {/* WITNESSES SECTION */}
            <div>
              <div className="flex items-center justify-between border-b pb-2 mb-4">
                <h2 className="text-lg font-medium">Testemunhas e Cards Relacionados</h2>
              </div>
              <WitnessesList control={control} register={register} errors={errors} mediaFiles={mediaFiles} />
            </div>

          </div>

        </form>
      </div>
    </div>
  );
}

// ─── Helpers Components ───────────────────────────────────────────────────────

function TabButton({ id, active, onClick, label }: { id: any, active: string, onClick: any, label: string }) {
  return (
    <button
      type="button"
      onClick={() => onClick(id)}
      className={cn(
        "text-left px-4 py-3 rounded-md text-sm font-medium transition-colors",
        active === id 
          ? "bg-primary text-primary-foreground" 
          : "hover:bg-muted text-muted-foreground"
      )}
    >
      {label}
    </button>
  );
}

function Field({ label, children }: { label: string, children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</label>
      {children}
    </div>
  );
}

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>((props, ref) => (
  <input ref={ref} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" {...props} />
));
Input.displayName = "Input";

const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>((props, ref) => (
  <textarea ref={ref} className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" {...props} />
));
Textarea.displayName = "Textarea";

const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>((props, ref) => (
  <select ref={ref} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" {...props} />
));
Select.displayName = "Select";

function Error({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <span className="text-xs text-destructive">{msg}</span>;
}

// ─── Survival Probabilities List ──────────────────────────────────────────────

function SurvivalProbabilitiesList({ control, register }: any) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "incident_data.survival_probabilities"
  });

  return (
    <div className="space-y-4">
      {fields.map((field, index) => (
        <div key={field.id} className="flex gap-4 items-start">
          <div className="flex-1">
            <Field label="Decisão">
              <Input {...register(`incident_data.survival_probabilities.${index}.decision`)} placeholder="Ex: Manter Rota" />
            </Field>
          </div>
          <div className="flex-1">
            <Field label="Probabilidade">
              <Input {...register(`incident_data.survival_probabilities.${index}.probability`)} placeholder="Ex: 85% para ocupantes" />
            </Field>
          </div>
          <Button type="button" variant="ghost" size="icon" className="mt-6 text-muted-foreground hover:text-destructive" onClick={() => remove(index)}>
            <Trash2 className="size-4" />
          </Button>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={() => append({ decision: "", probability: "" })}>
        <Plus className="size-4 mr-2" /> Adicionar Probabilidade
      </Button>
    </div>
  );
}

// ─── Evidence List ────────────────────────────────────────────────────────────

function EvidenceList({ control, register, errors, mediaFiles }: any) {
  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "evidence"
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = fields.findIndex((f) => f.id === active.id);
      const newIndex = fields.findIndex((f) => f.id === over.id);
      move(oldIndex, newIndex);
    }
  };

  return (
    <div className="space-y-4">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={fields.map(f => f.id)} strategy={verticalListSortingStrategy}>
          {fields.map((field, index) => (
            <SortableEvidenceItem 
              key={field.id} 
              id={field.id} 
              index={index} 
              register={register} 
              remove={remove} 
              mediaFiles={mediaFiles}
              control={control}
            />
          ))}
        </SortableContext>
      </DndContext>
      <Button type="button" variant="outline" size="sm" onClick={() => append({ number: fields.length + 1, title: "", description: "", category: "system_data", reveal_phase: "intro" })}>
        <Plus className="size-4 mr-2" /> Adicionar Evidência
      </Button>
    </div>
  );
}

function SortableEvidenceItem({ id, index, register, remove, mediaFiles, control }: any) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="p-4 border rounded-md bg-muted/10 relative flex gap-4">
      <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground pt-1">
        <GripVertical className="size-5" />
      </div>
      <div className="flex-1">
        <button type="button" onClick={() => remove(index)} className="absolute top-4 right-4 text-muted-foreground hover:text-destructive">
          <Trash2 className="size-4" />
        </button>
        
        <h4 className="text-sm font-semibold mb-3">Evidência #{index + 1}</h4>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <Field label="Número">
            <Input type="number" {...register(`evidence.${index}.number`, { valueAsNumber: true })} />
          </Field>
          <Field label="Categoria">
            <Select {...register(`evidence.${index}.category`)}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </Select>
          </Field>
        </div>
        
        <div className="space-y-4">
          <Field label="Título">
            <Input {...register(`evidence.${index}.title`)} />
          </Field>
          <Field label="Descrição">
            <Textarea rows={2} {...register(`evidence.${index}.description`)} />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4">
          <Field label="Caminho do Documento (Op)">
            <Controller
              control={control}
              name={`evidence.${index}.document_path`}
              render={({ field }) => (
                <Select 
                  {...field} 
                  value={field.value || ""} 
                  onChange={(e) => field.onChange(e.target.value === "" ? null : e.target.value)}
                >
                  <option value="">Nenhum</option>
                  {mediaFiles?.evidence?.map((file: string) => (
                    <option key={file} value={file}>{file.split('/').pop()}</option>
                  ))}
                </Select>
              )}
            />
          </Field>
          <Field label="Caminho da Imagem (Op)">
            <Controller
              control={control}
              name={`evidence.${index}.image_path`}
              render={({ field }) => (
                <Select 
                  {...field} 
                  value={field.value || ""} 
                  onChange={(e) => field.onChange(e.target.value === "" ? null : e.target.value)}
                >
                  <option value="">Nenhum</option>
                  {mediaFiles?.evidence?.map((file: string) => (
                    <option key={file} value={file}>{file.split('/').pop()}</option>
                  ))}
                </Select>
              )}
            />
          </Field>
        </div>
      </div>
    </div>
  );
}

// ─── Witnesses List ───────────────────────────────────────────────────────────

function WitnessesList({ control, register, errors, mediaFiles }: any) {
  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "witnesses"
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = fields.findIndex((f) => f.id === active.id);
      const newIndex = fields.findIndex((f) => f.id === over.id);
      move(oldIndex, newIndex);
    }
  };

  return (
    <div className="space-y-6">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={fields.map(f => f.id)} strategy={verticalListSortingStrategy}>
          {fields.map((field, index) => (
            <SortableWitnessItem 
              key={field.id} 
              id={field.id} 
              index={index} 
              register={register} 
              remove={remove} 
              control={control}
              mediaFiles={mediaFiles}
            />
          ))}
        </SortableContext>
      </DndContext>
      <Button type="button" variant="outline" size="sm" onClick={() => append({ number: fields.length + 1, name: "", role: "", evidence_cards: [] })}>
        <Plus className="size-4 mr-2" /> Adicionar Testemunha
      </Button>
    </div>
  );
}

function SortableWitnessItem({ id, index, register, remove, control, mediaFiles }: any) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="p-4 border border-l-4 border-l-primary rounded-md bg-muted/10 relative flex gap-4">
      <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground pt-1">
        <GripVertical className="size-5" />
      </div>
      <div className="flex-1">
        <button type="button" onClick={() => remove(index)} className="absolute top-4 right-4 text-muted-foreground hover:text-destructive">
          <Trash2 className="size-4" />
        </button>
        
        <h4 className="text-sm font-semibold mb-3">Testemunha #{index + 1}</h4>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <Field label="Número">
            <Input type="number" {...register(`witnesses.${index}.number`, { valueAsNumber: true })} />
          </Field>
          <Field label="Duração do Vídeo (s)">
            <Input type="number" {...register(`witnesses.${index}.duration_seconds`, { setValueAs: toNumberOrNull })} />
          </Field>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <Field label="Nome">
            <Input {...register(`witnesses.${index}.name`)} />
          </Field>
          <Field label="Papel / Ocupação">
            <Input {...register(`witnesses.${index}.role`)} />
          </Field>
        </div>
        
        <div className="space-y-4 mb-4">
          <Field label="Introdução do Mediador">
            <Textarea rows={2} {...register(`witnesses.${index}.mediator_intro`)} />
          </Field>
          <Field label="Caminho do Vídeo (Op)">
            <Controller
              control={control}
              name={`witnesses.${index}.video_path`}
              render={({ field }) => (
                <Select 
                  {...field} 
                  value={field.value || ""} 
                  onChange={(e) => field.onChange(e.target.value === "" ? null : e.target.value)}
                >
                  <option value="">Nenhum</option>
                  {mediaFiles?.witnesses?.map((file: string) => (
                    <option key={file} value={file}>{file.split('/').pop()}</option>
                  ))}
                </Select>
              )}
            />
          </Field>
        </div>

        <div className="mt-6 pt-4 border-t">
          <h5 className="text-sm font-medium mb-3 flex items-center gap-2">
            Cards de Evidência da Testemunha
            <Info className="size-3.5 text-muted-foreground" title="Cartas que são reveladas durante ou após o depoimento" />
          </h5>
          <EvidenceCardsList control={control} register={register} witnessIndex={index} />
        </div>
      </div>
    </div>
  );
}

function EvidenceCardsList({ control, register, witnessIndex }: any) {
  const { fields, append, remove, move } = useFieldArray({
    control,
    name: `witnesses.${witnessIndex}.evidence_cards`
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = fields.findIndex((f) => f.id === active.id);
      const newIndex = fields.findIndex((f) => f.id === over.id);
      move(oldIndex, newIndex);
    }
  };

  return (
    <div className="space-y-3">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={fields.map(f => f.id)} strategy={verticalListSortingStrategy}>
          {fields.map((field, index) => (
            <SortableCardItem 
              key={field.id}
              id={field.id}
              index={index}
              witnessIndex={witnessIndex}
              register={register}
              remove={remove}
            />
          ))}
        </SortableContext>
      </DndContext>
      <Button type="button" variant="secondary" size="sm" onClick={() => append({ title: "", content: "", source: "", type: "statement", reliability: "unknown", auto_reveal: true })}>
        <Plus className="size-3 mr-2" /> Adicionar Card
      </Button>
    </div>
  );
}

function SortableCardItem({ id, index, witnessIndex, register, remove }: any) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="p-3 border border-dashed rounded-md bg-background relative pr-10 flex gap-3">
      <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground pt-1">
        <GripVertical className="size-4" />
      </div>
      <div className="flex-1">
        <button type="button" onClick={() => remove(index)} className="absolute top-3 right-3 text-muted-foreground hover:text-destructive">
          <Trash2 className="size-4" />
        </button>
        
        <div className="grid grid-cols-3 gap-3 mb-3">
          <Field label="Título">
            <Input {...register(`witnesses.${witnessIndex}.evidence_cards.${index}.title`)} />
          </Field>
          <Field label="Tipo">
            <Select {...register(`witnesses.${witnessIndex}.evidence_cards.${index}.type`)}>
              {CATEGORIES.map((c: any) => <option key={c} value={c}>{c}</option>)}
            </Select>
          </Field>
          <Field label="Confiabilidade">
            <Select {...register(`witnesses.${witnessIndex}.evidence_cards.${index}.reliability`)}>
              {RELIABILITIES.map((c: any) => <option key={c} value={c}>{c}</option>)}
            </Select>
          </Field>
        </div>
        
        <Field label="Conteúdo">
          <Textarea rows={2} {...register(`witnesses.${witnessIndex}.evidence_cards.${index}.content`)} />
        </Field>
        
        <div className="mt-3 flex items-center gap-4">
          <div className="flex-1">
            <Field label="Fonte">
              <Input {...register(`witnesses.${witnessIndex}.evidence_cards.${index}.source`)} />
            </Field>
          </div>
          <div className="flex items-center h-10 mt-5">
            <input type="checkbox" {...register(`witnesses.${witnessIndex}.evidence_cards.${index}.auto_reveal`)} className="size-4" />
            <span className="ml-2 text-xs">Auto revelar</span>
          </div>
        </div>
      </div>
    </div>
  );
}
