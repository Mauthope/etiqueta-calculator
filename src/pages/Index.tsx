import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";

type Etiqueta = {
  id: number;
  op: string;
  carimbadeira: string;
  quantidade_etiqueta: number;
  quantidade_maquina: number;
  percentual_erro: number;
  created_at: string;
  componente: string;
};

const CARIMBADEIRAS = ["CR-01", "CR-02", "CR-03", "CR-04", "CR-05", "CR-06", "Esplanada"];
const COMPONENTES = [
  "Flap",
  "Válvula",
  "Patch",
  "Topo",
  "Fundo",
  "Saia",
  "Etiqueta Regata",
  "Liner",
  "Válvula de Enchimento",
  "Válvula de Descarga"
];

const Index = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    op: "",
    carimbadeira: "",
    quantidade_etiqueta: "",
    quantidade_maquina: "",
    componente: "Flap",
  });

  // Buscar dados
  const { data: etiquetas = [], refetch } = useQuery({
    queryKey: ["etiquetas"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("etiquetas")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Etiqueta[];
    },
  });

  const handleOPChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numericValue = e.target.value.replace(/\D/g, "").slice(0, 10);
    setFormData((prev) => ({
      ...prev,
      op: numericValue,
    }));
  };

  // Calcular médias
  const mediaErroGeral = etiquetas.length > 0
    ? (etiquetas.reduce((acc, curr) => acc + curr.percentual_erro, 0) / etiquetas.length).toFixed(2)
    : "0.00";

  const mediaErroPorCarimbadeira = CARIMBADEIRAS.map(carimbadeira => {
    const registros = etiquetas.filter(e => e.carimbadeira === carimbadeira);
    const media = registros.length > 0
      ? (registros.reduce((acc, curr) => acc + curr.percentual_erro, 0) / registros.length).toFixed(2)
      : "0.00";
    return { carimbadeira, media };
  });

  const mediaErroPorComponente = COMPONENTES.map(componente => {
    const registros = etiquetas.filter(e => e.componente === componente);
    const media = registros.length > 0
      ? (registros.reduce((acc, curr) => acc + curr.percentual_erro, 0) / registros.length).toFixed(2)
      : "0.00";
    return { componente, media };
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const qtdEtiqueta = parseInt(formData.quantidade_etiqueta);
    const qtdMaquina = parseInt(formData.quantidade_maquina);
    const percentualErro = (qtdMaquina / qtdEtiqueta - 1) * 100;

    try {
      const { error } = await supabase.from("etiquetas").insert([
        {
          op: formData.op,
          carimbadeira: formData.carimbadeira,
          quantidade_etiqueta: qtdEtiqueta,
          quantidade_maquina: qtdMaquina,
          percentual_erro: percentualErro,
          componente: formData.componente,
        },
      ]);

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Registro adicionado com sucesso.",
      });

      setFormData({
        op: "",
        carimbadeira: "",
        quantidade_etiqueta: "",
        quantidade_maquina: "",
        componente: "Flap",
      });
      refetch();
    } catch (error) {
      console.error("Erro ao salvar:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível salvar o registro.",
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">
        Indicador Carimbadeira
      </h1>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Formulário */}
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Novo Registro</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="op" className="block text-sm font-medium mb-1">
                    Ordem de Produção
                  </label>
                  <Input
                    id="op"
                    name="op"
                    value={formData.op}
                    onChange={handleOPChange}
                    placeholder="Digite apenas números"
                    maxLength={10}
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="carimbadeira"
                    className="block text-sm font-medium mb-1"
                  >
                    Carimbadeira
                  </label>
                  <Select
                    value={formData.carimbadeira}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, carimbadeira: value }))
                    }
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a carimbadeira" />
                    </SelectTrigger>
                    <SelectContent>
                      {CARIMBADEIRAS.map((carimbadeira) => (
                        <SelectItem key={carimbadeira} value={carimbadeira}>
                          {carimbadeira}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label
                    htmlFor="quantidade_etiqueta"
                    className="block text-sm font-medium mb-1"
                  >
                    Quantidade de Etiquetas
                  </label>
                  <Input
                    id="quantidade_etiqueta"
                    name="quantidade_etiqueta"
                    type="number"
                    value={formData.quantidade_etiqueta}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="quantidade_maquina"
                    className="block text-sm font-medium mb-1"
                  >
                    Quantidade na Máquina
                  </label>
                  <Input
                    id="quantidade_maquina"
                    name="quantidade_maquina"
                    type="number"
                    value={formData.quantidade_maquina}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="componente"
                    className="block text-sm font-medium mb-1"
                  >
                    Componente
                  </label>
                  <Select
                    value={formData.componente}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, componente: value }))
                    }
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o componente" />
                    </SelectTrigger>
                    <SelectContent>
                      {COMPONENTES.map((componente) => (
                        <SelectItem key={componente} value={componente}>
                          {componente}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button type="submit" className="w-full">
                  Salvar
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Médias de Erro</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium">Média Geral de Erro:</p>
                  <p className="text-2xl font-bold">{mediaErroGeral}%</p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-2">Média por Carimbadeira:</p>
                  <div className="space-y-2">
                    {mediaErroPorCarimbadeira.map(({ carimbadeira, media }) => (
                      <div key={carimbadeira} className="flex justify-between items-center">
                        <span className="text-sm">{carimbadeira}:</span>
                        <span className="font-medium">{media}%</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium mb-2">Média por Componente:</p>
                  <div className="space-y-2">
                    {mediaErroPorComponente.map(({ componente, media }) => (
                      <div key={componente} className="flex justify-between items-center">
                        <span className="text-sm">{componente}:</span>
                        <span className="font-medium">{media}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabela de Registros */}
        <Card>
          <CardHeader>
            <CardTitle>Registros</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px]">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>OP</TableHead>
                      <TableHead>Carimbadeira</TableHead>
                      <TableHead>Componente</TableHead>
                      <TableHead>Qtd. Etiquetas</TableHead>
                      <TableHead>Qtd. Máquina</TableHead>
                      <TableHead>Erro (%)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {etiquetas?.map((etiqueta) => (
                      <TableRow key={etiqueta.id}>
                        <TableCell>{etiqueta.op}</TableCell>
                        <TableCell>{etiqueta.carimbadeira}</TableCell>
                        <TableCell>{etiqueta.componente}</TableCell>
                        <TableCell>{etiqueta.quantidade_etiqueta}</TableCell>
                        <TableCell>{etiqueta.quantidade_maquina}</TableCell>
                        <TableCell>
                          {etiqueta.percentual_erro.toFixed(2)}%
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
