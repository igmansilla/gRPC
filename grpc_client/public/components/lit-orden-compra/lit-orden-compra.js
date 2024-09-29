import { LitElement, html, css } from "https://cdn.skypack.dev/lit";

class LitOrdenCompra extends LitElement {
  static styles = css`
    form {
      display: flex;
      flex-direction: column;
      max-width: 400px;
      margin: 20px auto;
      padding: 20px;
      border: 1px solid #ccc;
      border-radius: 10px;
      background-color: #fff;
    }

    label {
      margin-top: 10px;
      font-weight: bold;
    }

    input, select {
      padding: 8px;
      margin-top: 5px;
      font-size: 16px;
    }

    button {
      margin-top: 20px;
      padding: 10px;
      background-color: #007bff;
      color: white;
      border: none;
      cursor: pointer;
      border-radius: 5px;
      font-size: 16px;
    }

    button:hover {
      background-color: #0056b3;
    }
  `;

  static properties = {
    cliente: { type: String },
    producto: { type: String },
    cantidad: { type: Number },
    precio: { type: Number }
  };

  constructor() {
    super();
    this.cliente = '';
    this.producto = '';
    this.cantidad = 1;
    this.precio = 0;
  }

  handleSubmit(e) {
    e.preventDefault();
    const orden = {
      cliente: this.cliente,
      producto: this.producto,
      cantidad: this.cantidad,
      precio: this.precio
    };

    // Enviar la orden al backend
    fetch('/orden-de-compra', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(orden)
    })
    .then(response => response.json())
    .then(data => {
      console.log('Orden enviada:', data);
      alert('Orden de compra enviada correctamente.');
    })
    .catch(error => {
      console.error('Error al enviar la orden:', error);
    });
  }

  render() {
    return html`
      <form @submit="${this.handleSubmit}">
        <label for="cliente">Cliente:</label>
        <input type="text" id="cliente" .value="${this.cliente}" @input="${e => this.cliente = e.target.value}" required>

        <label for="producto">Producto:</label>
        <input type="text" id="producto" .value="${this.producto}" @input="${e => this.producto = e.target.value}" required>

        <label for="cantidad">Cantidad:</label>
        <input type="number" id="cantidad" value="${this.cantidad}" @input="${e => this.cantidad = e.target.value}" min="1" required>

        <label for="precio">Precio:</label>
        <input type="number" id="precio" value="${this.precio}" @input="${e => this.precio = e.target.value}" min="0" required>

        <button type="submit">Crear Orden de Compra</button>
      </form>
    `;
  }
}

customElements.define('lit-orden-compra', LitOrdenCompra);
