import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
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

type Etiqueta = {
  id: number;
  op: string;
  carimbadeira: string;
  quantidade_etiqueta: number;
  quantidade_maquina: number;
  percentual_erro: number;
  created_at: string;
};

const Index = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    op: "",
    carimbadeira: "",
    quantidade_etiqueta: "",
    quantidade_maquina: "",
  });

  // Buscar dados
  const { data: etiquetas, refetch } = useQuery({
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

  // Manipular envio do formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Calcular percentual de erro
    const qtdEtiqueta = parseInt(formData.quantidade_etiqueta);
    const qtdMaquina = parseInt(formData.quantidade_maquina);
    const percentualErro = ((qtdEtiqueta - qtdMaquina) / qtdEtiqueta) * 100;

    try {
      const { error } = await supabase.from("etiquetas").insert([
        {
          op: formData.op,
          carimbadeira: formData.carimbadeira,
          quantidade_etiqueta: qtdEtiqueta,
          quantidade_maquina: qtdMaquina,
          percentual_erro: percentualErro,
        },
      ]);

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Registro adicionado com sucesso.",
      });

      // Limpar formulário e atualizar dados
      setFormData({
        op: "",
        carimbadeira: "",
        quantidade_etiqueta: "",
        quantidade_maquina: "",
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
                  onChange={handleChange}
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
                <Input
                  id="carimbadeira"
                  name="carimbadeira"
                  value={formData.carimbadeira}
                  onChange={handleChange}
                  required
                />
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

              <Button type="submit" className="w-full">
                Salvar
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Tabela de Registros */}
        <Card>
          <CardHeader>
            <CardTitle>Registros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>OP</TableHead>
                    <TableHead>Carimbadeira</TableHead>
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;