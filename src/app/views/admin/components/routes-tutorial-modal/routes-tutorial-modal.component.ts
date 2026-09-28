import { Component, HostListener, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface TutorialItem {
  icon: string;
  title: string;
  text: string;
}

export interface TutorialStep {
  stepNumber: number;
  badge: string;
  icon: string;
  title: string;
  description: string;
  items: TutorialItem[];
}

@Component({
  selector: 'app-routes-tutorial-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './routes-tutorial-modal.component.html',
  styleUrl: './routes-tutorial-modal.component.scss'
})
export class RoutesTutorialModalComponent {
  readonly isOpen = input<boolean>(false);
  readonly closed = output<void>();

  readonly currentStep = signal<number>(0);

  readonly steps: TutorialStep[] = [
    {
      stepNumber: 1,
      badge: 'Passo 1 de 7',
      icon: 'fa-solid fa-map-location-dot',
      title: 'Visão Geral da Página de Rotas',
      description: 'Esta tela serve para você planejar suas visitas e entregas aos clientes de forma organizada e eficiente.',
      items: [
        {
          icon: 'fa-solid fa-map',
          title: 'Mapa Central',
          text: 'Mostra o mapa da sua região com os pontos de parada marcados e os caminhos desenhados.'
        },
        {
          icon: 'fa-solid fa-list-ol',
          title: 'Coluna Lateral',
          text: 'Lista todos os clientes adicionados, os horários previstos de chegada e a ordem das paradas.'
        },
        {
          icon: 'fa-solid fa-bullseye',
          title: 'Objetivo Principal',
          text: 'Calcular o menor trajeto possível para você gastar menos tempo e menos combustível no seu dia.'
        }
      ]
    },
    {
      stepNumber: 2,
      badge: 'Passo 2 de 7',
      icon: 'fa-regular fa-calendar-days',
      title: 'Calendário e Agendamento de Rotas',
      description: 'Você pode planejar rotas para os próximos dias ou consultar o que fez na semana passada.',
      items: [
        {
          icon: 'fa-solid fa-calendar-check',
          title: 'Escolher a Data',
          text: 'Clique no botão de calendário no topo da tela para abrir o calendário mensal.'
        },
        {
          icon: 'fa-solid fa-clock-rotate-left',
          title: 'Visualizar Histórico (Até 7 dias)',
          text: 'Você só pode abrir dias anteriores caso tenha uma rota salva naquele dia (identificados com uma bolinha verde). Dias passados sem rota ficam cinzas e bloqueados.'
        },
        {
          icon: 'fa-solid fa-calendar-plus',
          title: 'Agendar Futuro (Até 1 mês)',
          text: 'Você pode agendar rotas de hoje até 30 dias para frente (números pretos no calendário).'
        },
        {
          icon: 'fa-solid fa-floppy-disk',
          title: 'Salvar a Rota',
          text: 'Após organizar seus clientes, clique no botão "Salvar Rota" para gravar os dados do dia escolhido no sistema.'
        }
      ]
    },
    {
      stepNumber: 3,
      badge: 'Passo 3 de 7',
      icon: 'fa-solid fa-magnifying-glass-location',
      title: 'Como Buscar Endereços e Adicionar Pontos',
      description: 'Existem duas maneiras simples de colocar clientes na sua rota:',
      items: [
        {
          icon: 'fa-solid fa-keyboard',
          title: 'Pela Barra de Busca',
          text: 'Digite o nome da rua, número ou bairro na caixa "Buscar endereço..." e clique no endereço correto que aparecer na lista.'
        },
        {
          icon: 'fa-solid fa-arrow-pointer',
          title: 'Clicando Direto no Mapa',
          text: 'Clique em qualquer ponto do mapa onde fica o cliente. O endereço é preenchido sozinho automaticamente.'
        },
        {
          icon: 'fa-solid fa-tag',
          title: 'Identificar o Cliente',
          text: 'Na janela que abrir, digite o nome do cliente ou farmácia (ex: "Drogaria Central") e confirme para adicionar.'
        }
      ]
    },
    {
      stepNumber: 4,
      badge: 'Passo 4 de 7',
      icon: 'fa-solid fa-house-chimney-user',
      title: 'Ponto de Partida (Base) e Meus Favoritos',
      description: 'Configure de onde você sai e guarde os clientes mais frequentes para não redigitar endereços.',
      items: [
        {
          icon: 'fa-solid fa-house',
          title: 'Ponto de Partida (Sua Base)',
          text: 'É o local de onde você sai (sua casa ou depósito). Ao adicionar um ponto no mapa, marque "Definir como Ponto de Partida (Base)". O sistema sempre iniciará seu percurso desse local.'
        },
        {
          icon: 'fa-solid fa-star',
          title: 'Salvar como Favorito',
          text: 'Marque a opção "Salvar como Favorito" ao cadastrar um cliente para guardá-lo permanentemente na sua conta.'
        },
        {
          icon: 'fa-solid fa-bookmark',
          title: 'Botão "Meus Favoritos"',
          text: 'No topo da tela, clique em "Meus Favoritos" para ver sua lista e adicionar clientes à rota com apenas um clique.'
        }
      ]
    },
    {
      stepNumber: 5,
      badge: 'Passo 5 de 7',
      icon: 'fa-solid fa-list-check',
      title: 'Prioridades e Fixar Ordem das Visitas',
      description: 'Defina a urgência dos clientes e trave paradas em posições obrigatórias.',
      items: [
        {
          icon: 'fa-solid fa-flag',
          title: 'Prioridade da Visita',
          text: 'Classifique o atendimento como "Normal", "Alta" ou "Urgente" para destacar clientes de maior importância comercial.'
        },
        {
          icon: 'fa-solid fa-lock',
          title: 'Fixar Ordem de Parada',
          text: 'Se você tem hora marcada ou precisa ir em um cliente antes de todos, escolha "1ª Parada Fixa" (ou 2ª, 3ª...). O sistema vai travar esse cliente no lugar certo e organizar os outros ao redor dele.'
        },
        {
          icon: 'fa-solid fa-route',
          title: 'Paradas Livres',
          text: 'Os clientes sem ordem fixada serão organizados pelo sistema no trajeto mais rápido possível.'
        }
      ]
    },
    {
      stepNumber: 6,
      badge: 'Passo 6 de 7',
      icon: 'fa-solid fa-stopwatch',
      title: 'Tempo de Parada em Cada Cliente',
      description: 'O tempo de parada é a quantidade de minutos que você pretende passar no cliente atendendo ou descarregando.',
      items: [
        {
          icon: 'fa-solid fa-clock',
          title: 'Tempo Individual',
          text: 'Ao cadastrar ou editar o cliente, preencha o campo "Duração da Visita" com os minutos necessários (ex: 20 minutos).'
        },
        {
          icon: 'fa-solid fa-calculator',
          title: 'Se preencher apenas em alguns clientes',
          text: 'O sistema calcula a média de tempo dos que foram preenchidos e usa essa mesma média automaticamente nos clientes que você deixou em branco.'
        },
        {
          icon: 'fa-solid fa-ban',
          title: 'Se não preencher em nenhum cliente',
          text: 'O sistema desconsidera o tempo de atendimento e calcula a rota considerando apenas o tempo de volante nas ruas.'
        }
      ]
    },
    {
      stepNumber: 7,
      badge: 'Passo 7 de 7',
      icon: 'fa-solid fa-file-pdf',
      title: 'Gerar Rota, Filtrar Trechos e Baixar PDF',
      description: 'Depois de adicionar os clientes, veja o resultado completo e leve o roteiro com você.',
      items: [
        {
          icon: 'fa-solid fa-wand-magic-sparkles',
          title: 'Calcular Rota',
          text: 'Clique no botão verde "Calcular Rota". O sistema traça as ruas no mapa e gera a sequência ideal com horários de chegada e saída.'
        },
        {
          icon: 'fa-solid fa-arrows-up-down',
          title: 'Ajustar Manualmente',
          text: 'Se preferir mudar a sequência, você pode arrastar e soltar os clientes na lista para colocar na ordem que desejar.'
        },
        {
          icon: 'fa-solid fa-filter',
          title: 'Filtrar Trecho no Mapa',
          text: 'Clique em qualquer cliente na lista para aproximar o mapa e destacar apenas o caminho até ele com a cor do trecho.'
        },
        {
          icon: 'fa-solid fa-download',
          title: 'Exportar PDF Oficial',
          text: 'Clique em "Exportar PDF" para baixar um documento pronto para impressão ou consulta no celular com o mapa e todos os endereços organizados.'
        }
      ]
    }
  ];

  get currentStepData(): TutorialStep {
    return this.steps[this.currentStep()];
  }

  get isFirstStep(): boolean {
    return this.currentStep() === 0;
  }

  get isLastStep(): boolean {
    return this.currentStep() === this.steps.length - 1;
  }

  nextStep(): void {
    if (this.isLastStep) {
      this.closeModal();
    } else {
      this.currentStep.update(s => s + 1);
    }
  }

  prevStep(): void {
    if (!this.isFirstStep) {
      this.currentStep.update(s => s - 1);
    }
  }

  goToStep(index: number): void {
    if (index >= 0 && index < this.steps.length) {
      this.currentStep.set(index);
    }
  }

  closeModal(): void {
    this.closed.emit();
    // Reseta para o primeiro passo para a próxima abertura
    setTimeout(() => {
      this.currentStep.set(0);
    }, 200);
  }

  @HostListener('document:keydown.escape')
  onEscapePress(): void {
    if (this.isOpen()) {
      this.closeModal();
    }
  }
}
