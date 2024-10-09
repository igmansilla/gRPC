import { LitElement, html, css } from 'https://cdn.skypack.dev/lit';

class NovedadesCasaCentral extends LitElement {
  static styles = css`
    .novedades-container {
      padding: 20px;
      max-width: 800px;
      margin: 0 auto;
    }

    .producto {
      border: 1px solid #ccc;
      padding: 15px;
      margin-bottom: 15px;
      border-radius: 5px;
      background-color: #f9f9f9;
    }

    h2 {
      text-align: center;
      color: #4CAF50;
    }

    label {
      font-weight: bold;
      display: block;
    }

    select, button {
      margin-top: 10px;
      padding: 8px;
      width: 100%;
    }

    button {
      background-color: #4CAF50;
      color: white;
      border: none;
      cursor: pointer;
    }

    button:hover {
      background-color: #45a049;
    }

    .producto-header {
      font-size: 1.2em;
      margin-bottom: 10px;
    }

    .mensaje-alta {
      color: green;
      font-weight: bold;
      margin-top: 10px;
    }
  `;

  static properties = {
    novedades: { type: Array },
    mensajeAlta: { type: Object }
  };

  constructor() {
    super();
    this.novedades = [];
    this.mensajeAlta = {};
  }

  connectedCallback() {
    super.connectedCallback();
    this._fetchNovedades();
  }

  async _fetchNovedades() {
    try {
      const response = await fetch('/novedades');
      if (response.ok) {
        this.novedades = await response.json();
      } else {
        console.error('Error al obtener novedades');
      }
    } catch (error) {
      console.error('Error de red:', error);
    }
  }

  _darDeAltaProducto(producto, tallesSeleccionados, coloresSeleccionados) {
    this.mensajeAlta[producto.codigo] = `Producto ${producto.nombre} dado de alta exitosamente con talles: ${tallesSeleccionados.join(', ')} y colores: ${coloresSeleccionados.join(', ')}`;
    
    this.requestUpdate();
  }

  render() {
    return html`
      <div class="novedades-container">
        <h2>Novedades - Catálogo de Nuevos Productos</h2>
        ${this.novedades.map(producto => this._renderProducto(producto))}
      </div>
    `;
  }

  _renderProducto(producto) {
    return html`
      <div class="producto">
        <div class="producto-header">${producto.nombre} (Código: ${producto.codigo})</div>
        
        <label>Talles disponibles:</label>
        <select multiple id="talles-${producto.codigo.trim()}">
          ${producto.talles.map(talle => html`<option value="${talle}">${talle}</option>`)}
        </select>

        <label>Colores disponibles:</label>
        <select multiple id="colores-${producto.codigo.trim()}">
          ${producto.colores.map(color => html`<option value="${color}">${color}</option>`)}
        </select>

        <button @click="${() => this._handleAltaProducto(producto)}">Dar de alta producto</button>

        ${this.mensajeAlta[producto.codigo] 
          ? html`<div class="mensaje-alta">${this.mensajeAlta[producto.codigo]}</div>` 
          : ''}
      </div>
    `;
  }

  _handleAltaProducto(producto) {
    const tallesSeleccionados = Array.from(this.shadowRoot.querySelector(`#talles-${producto.codigo}`).selectedOptions)
      .map(option => option.value);
    
    const coloresSeleccionados = Array.from(this.shadowRoot.querySelector(`#colores-${producto.codigo}`).selectedOptions)
      .map(option => option.value);
    
    if (tallesSeleccionados.length > 0 && coloresSeleccionados.length > 0) {
      this._darDeAltaProducto(producto, tallesSeleccionados, coloresSeleccionados);
    } else {
      alert('Debe seleccionar al menos un talle y un color.');
    }
  }
}

customElements.define('lit-novedades', NovedadesCasaCentral);
