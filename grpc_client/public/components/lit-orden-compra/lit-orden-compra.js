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

    input,
    select {
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

    .item-group {
      margin-top: 20px;
      border: 1px solid #ccc;
      padding: 10px;
      border-radius: 5px;
    }

    .orden-list {
      margin: 20px;
      padding: 10px;
      border: 1px solid #ccc;
      border-radius: 5px;
      background-color: #f9f9f9;
    }
  `;

  static properties = {
    ordenes: { type: Array },
    mostrarFormulario: { type: Boolean },
    tienda_id: { type: String },
    estado: { type: String },
    observaciones: { type: String },
    items: { type: Array },
    producto: { type: String },
    color: { type: String },
    talle: { type: String },
    cantidad: { type: Number },
  };

  constructor() {
    super();
    this.ordenes = []; // Lista de órdenes de compra
    this.mostrarFormulario = false; // Controlar la visibilidad del formulario
    this.tienda_id = "T001";
    this.estado = "SOLICITADA"; // Estado por defecto
    this.observaciones = "";
    this.items = [];
    this.productos = [
      {
        id: "A001",
        nombre: "Producto A",
        talle: "M",
        color: "Rojo",
        foto: "url/to/fotoA",
      },
      {
        id: "B002",
        nombre: "Producto B",
        talle: "L",
        color: "Azul",
        foto: "url/to/fotoB",
      },
    ];
    this.producto = "Producto A"; // Cambiado al primer producto disponible
    this.color = "Rojo"; // Cambiado al color del Producto A
    this.talle = "M"; // Cambiado al talle del Producto A
    this.cantidad = 1; // Valor por defecto
  }

  toggleFormulario() {
    this.mostrarFormulario = !this.mostrarFormulario; // Alternar visibilidad
  }

  agregarItem() {
    const selectedProduct = this.productos.find(
      (producto) => producto.nombre === this.producto
    );

    if (selectedProduct) {
      const item = {
        producto: selectedProduct.nombre, // Captura el nombre del producto
        producto_id: selectedProduct.id, // Captura el ID del producto
        color: selectedProduct.color,
        talle: selectedProduct.talle,
        cantidad: this.cantidad,
      };

      this.items = [...this.items, item];

      // Limpia los campos después de agregar un ítem
      this.producto = "Producto A"; // Resetea al valor por defecto
      this.color = "Rojo"; // Resetea al color por defecto
      this.talle = "M"; // Resetea al talle por defecto
      this.cantidad = 1; // Resetea la cantidad al valor por defecto
    }
  }

  handleSubmit(e) {
    e.preventDefault();

    const orden = {
      tienda_id: this.tienda_id,
      estado: this.estado,
      observaciones: this.observaciones,
      items: this.items,
    };

    // Enviar la orden al backend
    fetch("/orden-de-compra", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(orden),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Orden enviada:", data);
        alert("Orden de compra enviada correctamente.");
        this.items = []; // Limpia los ítems después de enviar la orden
        this.toggleFormulario(); // Ocultar el formulario
      })
      .catch((error) => {
        console.error("Error al enviar la orden:", error);
      });
  }

  render() {
    return html`
      <div class="orden-list">
        <h2>Órdenes de Compra</h2>
        <ul>
          ${this.ordenes.map(
            (orden) => html`
              <li>
                ${orden.tienda_id} - ${orden.estado} - ${orden.observaciones}
              </li>
            `
          )}
        </ul>
        <button @click="${this.toggleFormulario}">
          Agregar Nueva Orden de Compra
        </button>
      </div>

      ${this.mostrarFormulario
        ? html`
            <form @submit="${this.handleSubmit}">
              <label for="tienda_id">ID de la tienda:</label>
              <select
                id="tienda_id"
                @change="${(e) => (this.tienda_id = e.target.value)}"
              >
                <option value="T001" ?selected="${this.tienda_id === "T001"}">
                  T001
                </option>
                <option value="T002" ?selected="${this.tienda_id === "T002"}">
                  T002
                </option>
              </select>

              <label for="observaciones">Observaciones:</label>
              <input
                type="text"
                id="observaciones"
                .value="${this.observaciones}"
                @input="${(e) => (this.observaciones = e.target.value)}"
              />

              <div class="item-group">
                <h3>Agregar Producto</h3>

                <label for="producto">Producto:</label>
                <select
                  id="producto"
                  @change="${(e) => {
                    const selectedProduct = this.productos.find(
                      (producto) => producto.nombre === e.target.value
                    );
                    this.producto = e.target.value; // Captura el nombre del producto
                    this.selectedProductoId = selectedProduct
                      ? selectedProduct.id
                      : ""; // Captura el ID del producto
                  }}"
                >
                  ${this.productos.map(
                    (producto) => html`
                      <option
                        value="${producto.nombre}"
                        ?selected="${this.producto === producto.nombre}"
                      >
                        ${producto.nombre}
                      </option>
                    `
                  )}
                </select>

                <label for="color">Color:</label>
                <select
                  id="color"
                  @change="${(e) => (this.color = e.target.value)}"
                >
                  <option value="Rojo" ?selected="${this.color === "Rojo"}">
                    Rojo
                  </option>
                  <option value="Azul" ?selected="${this.color === "Azul"}">
                    Azul
                  </option>
                </select>

                <label for="talle">Talle:</label>
                <select
                  id="talle"
                  @change="${(e) => (this.talle = e.target.value)}"
                >
                  <option value="M" ?selected="${this.talle === "M"}">M</option>
                  <option value="L" ?selected="${this.talle === "L"}">L</option>
                </select>

                <label for="cantidad">Cantidad:</label>
                <select
                  id="cantidad"
                  @change="${(e) => (this.cantidad = Number(e.target.value))}"
                >
                  <option value="1" ?selected="${this.cantidad === 1}">
                    1
                  </option>
                  <option value="2" ?selected="${this.cantidad === 2}">
                    2
                  </option>
                  <option value="3" ?selected="${this.cantidad === 3}">
                    3
                  </option>
                  <option value="4" ?selected="${this.cantidad === 4}">
                    4
                  </option>
                  <option value="5" ?selected="${this.cantidad === 5}">
                    5
                  </option>
                </select>

                <button type="button" @click="${this.agregarItem}">
                  Agregar Item
                </button>
              </div>

              <div>
                <h3>Items agregados:</h3>
                <ul>
                  ${this.items.map(
                    (item) => html`
                      <li>
                        ${item.producto} - ${item.color} - ${item.talle} -
                        ${item.cantidad} unidades
                      </li>
                    `
                  )}
                </ul>
              </div>

              <button type="submit">Crear Orden de Compra</button>
            </form>
          `
        : ""}
    `;
  }
}

customElements.define("lit-orden-compra", LitOrdenCompra);
