import { LitElement, html, css } from "https://cdn.skypack.dev/lit";
import './alta-producto.js';
import './tabla-productos.js';

class GestionProductos extends LitElement {
  static styles = css`
    h1 {
      color: #4CAF50;
      text-align: center;
    }

    .header {
      display: flex;
      justify-content: center;
      margin-bottom: 20px;
    }

    button {
      padding: 10px;
      margin: 0 10px;
      background-color: #4CAF50;
      color: white;
      border: none;
      cursor: pointer;
    }

    button:hover {
      background-color: #45a049;
    }

    button.active {
      background-color: #333;
    }
  `;

  static properties = {
    vistaActual: { type: String },
  };

  constructor() {
    super();
    this.vistaActual = 'tabla'; // Vista predeterminada al cargar la página
  }

  render() {
    return html`
      <h1>Gestión de Productos</h1>
      <div class="header">
        <button 
          class="${this.vistaActual === 'tabla' ? 'active' : ''}" 
          @click="${() => this._cambiarVista('tabla')}">
          Ver Productos
        </button>
        <button 
          class="${this.vistaActual === 'alta' ? 'active' : ''}" 
          @click="${() => this._cambiarVista('alta')}">
          Alta de Producto
        </button>
      </div>

      ${this.vistaActual === 'alta' 
        ? html`<alta-producto @producto-actualizado="${this._refrescarProductos}"></alta-producto>`
        : html`<tabla-productos id="tabla"></tabla-productos>`
      }
    `;
  }

  _cambiarVista(vista) {
    this.vistaActual = vista;
  }

  _refrescarProductos() {
    if (this.vistaActual === 'tabla') {
      this.shadowRoot.querySelector('#tabla').fetchProductos();
    }
  }
}

customElements.define('gestion-productos', GestionProductos);
