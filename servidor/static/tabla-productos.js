import { LitElement, html, css } from "https://cdn.skypack.dev/lit";

class TablaProductos extends LitElement {
  static styles = css`
    table {
      width: 100%;
      margin: 20px auto;
      border-collapse: collapse;
    }
    th, td {
      border: 1px solid black;
      padding: 10px;
      text-align: left;
    }
    input[type="number"] {
      width: 80px;
      padding: 5px;
    }
    button {
      padding: 5px 10px;
      background-color: #4CAF50;
      color: white;
      border: none;
      cursor: pointer;
    }
    button:hover {
      background-color: #45a049;
    }
  `;

  static properties = {
    productos: { type: Array }
  };

  constructor() {
    super();
    this.productos = [];
  }

  render() {
    return html`
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Código</th>
            <th>Cantidad Stock</th>
            <th>Acción</th>
          </tr>
        </thead>
        <tbody>
          ${this.productos.map(producto => html`
            <tr>
              <td>${producto.id}</td>
              <td>${producto.nombre}</td>
              <td>${producto.codigo}</td>
              <td><input type="number" id="cantidad-${producto.codigo}" value="${producto.cantidad_stock_proveedor}" min="0"></td>
              <td><button @click="${() => this.modificarStock(producto.codigo)}">Actualizar</button></td>
            </tr>
          `)}
        </tbody>
      </table>
    `;
  }

  async modificarStock(productoCodigo) {
    const nuevaCantidad = this.shadowRoot.querySelector(`#cantidad-${productoCodigo}`).value;

    const response = await fetch('/productos/modificar', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        producto_id: productoCodigo,
        nueva_cantidad: nuevaCantidad
      })
    });

    if (response.ok) {
      alert(`Stock del producto ${productoCodigo} actualizado a ${nuevaCantidad}`);
      this.dispatchEvent(new CustomEvent('producto-actualizado'));
    } else {
      alert('Error al actualizar el stock del producto');
    }
  }

  async fetchProductos() {
    const response = await fetch('/productos');
    const productos = await response.json();
    this.productos = productos;
  }

  connectedCallback() {
    super.connectedCallback();
    this.fetchProductos();
  }
}

customElements.define('tabla-productos', TablaProductos);
