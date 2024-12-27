import { Component, NO_ERRORS_SCHEMA, OnInit, ViewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NomepessoaComponent } from "../components/nomepessoa/nomepessoa.component";
import { BotaoSortearComponent } from "../components/botao-sortear/botao-sortear.component";
import { TopbarComponent } from "../components/topbar/topbar.component";
import { NomesService } from '../services/nomes.service';
import { AvisoComponent } from "../components/aviso/aviso.component";
import { BotaoCarregarArquivoComponent } from '../components/botao-carregar-arquivo/botao-carregar-arquivo.component';
import { ForaDoLimiteError } from '../errors/ForaDoLimiteError';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    NomepessoaComponent,
    BotaoSortearComponent,
    BotaoCarregarArquivoComponent,
    TopbarComponent,
    AvisoComponent
],
schemas: [
  NO_ERRORS_SCHEMA
],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  title = 'Sorteador';
  nome: string = 'Aperte o botão abaixo para sortear o nome';
  nomes: string[] = [];
  sorteados: any[] = [];
  log: string = 'Os nomes sorteados aparecerão aqui';
  visivel: boolean = false;
  carregando: boolean = false;
  limite:number = -1;
  mensagem: string = '';
  titulo:string = ''
  constructor(private nomesService: NomesService){
    this.nomesService.lista().subscribe({
      next: (res) => {
        this.nomes.push(res);
      },
      error: (err) => {
        console.log("Erro: ", err)
      }
    })
  }
  ngOnInit() {

  }

  sortear() {
    if (this.sorteados.length < this.limite) {
      this.carregando = true;
      let posicao = Math.floor(Math.random() * (this.nomes.length - 0) + 0);
      this.nome = this.nomes[posicao];
      this.nomes = this.nomes.filter((p) => p != this.nome); //remove o nome do sorteio
      this.sorteados.push({
        nome: this.nome,
        timestamp: new Date().toLocaleString(),
      });
      setTimeout(() => {
        this.carregando = false;
        this.atualizarSorteados();
      }, 1000); //carrega a animação
    } else {
      // alert("Sorteio concluído! Reinicie a página para um novo sorteio");
      this.lancarDialogo('Sorteio Finalizado',"Reinicie a aplicação para realizar um novo sorteio")
    }
  }

  lancarDialogo(titulo: string, mensagem: string) {
    this.titulo = titulo
    this.mensagem = mensagem;
    this.visivel = true;
  }

  atualizarSorteados() {
    this.log = `Sorteio realizado em ${new Date().toLocaleDateString()}\n`;
    this.log += "Sorteados\n";
    this.sorteados.forEach((s) => {
      this.log += `\n${s.nome} - ${s.timestamp}`;
    });
    this.log += `\nSorteados: ${this.sorteados.length}, faltam ${this.limite - this.sorteados.length}`;
    if(this.todosSorteados()) this.lancarDialogo(
      'Sorteio Finalizado',
      'Reinicie a aplicação para realizar um novo sorteio'
    );
  }

  carregarNomes(event: any){
    const file: File = event.target.files[0];
    if (file) {
      //Lendo arquivo
      const fileReader = new FileReader();
      fileReader.onload = (event) => {
        let texto = event.target?.result as string;
        this.limite = parseInt(texto.split('\r\n')[0]); //configura o máximo de sorteados (se maior que o tamanho da lista, gera erro)
        this.nomes = texto.split('\r\n').slice(1);//retira a primeira linha
        this.nomes = this.nomes.slice(0, this.nomes.length-1)
        if(this.limite > this.nomes.length) {
          try{
            throw new ForaDoLimiteError();
          }catch(err: any){
            this.lancarDialogo("Erro", err.message);
          }
        }
      };
      fileReader.readAsText(file);
    }
  }

  reiniciar(){
    window.location.reload();
  }

  listaVazia(){
    return this.nomes.length == 0;
  }

  nenhumSorteado(){
    return this.sorteados.length == 0;
  }

  todosSorteados(){
    return this.limite == this.sorteados.length;
  }

  gerarLog(){
    let fileName = `log_sorteio_${new Date().toLocaleString('pt-BR')}.txt`
    const file = new Blob([this.log], {type: "text/plain"});
    const link = document.createElement("a");
    link.href = URL.createObjectURL(file);
    link.download = fileName;
    link.click()
    link.remove()
  }
}
