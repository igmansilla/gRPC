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
    .item-list {
      margin-top: 10px;
      border: 1px solid #eee;
      padding: 10px;
      border-radius: 5px;
      background-color: #fafafa;
    }

    /* Estilos para la tabla de órdenes */
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }

    th,
    td {
      padding: 10px;
      border: 1px solid #ddd;
      text-align: left;
    }

    th {
      background-color: #007bff;
      color: white;
    }

    tbody tr:nth-child(even) {
      background-color: #f2f2f2;
    }
  `;

  static properties = {
    ordenes: { type: Array },
    despachos: { type: Array },
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
    this.ordenes = []; 
    this.despachos = []; 
    this.mostrarFormulario = false; 
    this.tienda_id = "T001";
    this.estado = "SOLICITADA"; 
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
    this.producto = "Producto A"; 
    this.color = "Rojo"; 
    this.talle = "M"; 
    this.cantidad = 1; 

  }

  connectedCallback() {
    super.connectedCallback();
    this.fetchOrdenes();
  }

  async fetchOrdenes() {
    try {
      const response = await fetch("/solicitudes");
      if (response.ok) {
        this.ordenes = await response.json(); 
        await this.fetchDespachos(); 
      } else {
        console.error(
          "Error al obtener las órdenes de compra:",
          response.status
        );
      }
    } catch (error) {
      console.error("Error al realizar la solicitud:", error);
    }
  }

  toggleFormulario() {
    this.mostrarFormulario = !this.mostrarFormulario;
  }

  agregarItem() {
    const selectedProduct = this.productos.find(
      (producto) => producto.nombre === this.producto
    );

    if (selectedProduct) {
      const item = {
        producto: selectedProduct.nombre, 
        producto_id: selectedProduct.id, 
        color: selectedProduct.color,
        talle: selectedProduct.talle,
        cantidad: this.cantidad,
      };

      this.items = [...this.items, item];

     
      this.producto = "Producto A"; 
      this.color = "Rojo"; 
      this.talle = "M"; 
      this.cantidad = 1; 
    }
  }

  async handleSubmit(e) {
    e.preventDefault();

    const orden = {
      tienda_id: this.tienda_id,
      estado: this.estado,
      observaciones: this.observaciones,
      items: this.items,
    };

   
    try {
      const response = await fetch("/orden-de-compra", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orden),
      });

      if (response.ok) {
        const data = await response.json(); 
        console.log("Orden enviada:", data.message); 
        alert("Orden de compra enviada correctamente.");
        this.items = []; 
        this.toggleFormulario();
        await this.fetchOrdenes();
      } else {
        const errorData = await response.json(); 
        console.error("Error al enviar la orden:", errorData.message);
        alert("Error al enviar la orden: " + errorData.message);
      }
    } catch (error) {
      console.error("Error al enviar la orden:", error);
    }
  }

  async fetchDespachos() {
    try {
      const response = await fetch("/despachos"); 
      if (response.ok) {
        this.despachos = await response.json(); 
      } else {
        console.error("Error al obtener los despachos:", response.status);
      }
    } catch (error) {
      console.error("Error al realizar la solicitud:", error);
    }
  }

  async ordenRecibida(ordenId, despachoId) {
    try {
      const response = await fetch(`/orden-recibida`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orden_id: ordenId, despacho_id: despachoId }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Orden recibida:", data.message);
        alert("Orden marcada como recibida.");
        await this.fetchOrdenes(); 
      } else {
        const errorData = await response.json();
        console.error(
          "Error al marcar la orden como recibida:",
          errorData.message
        );
        alert("Error al marcar la orden como recibida: " + errorData.message);
      }
    } catch (error) {
      console.error("Error al realizar la solicitud:", error);
    }
  }

  render() {
    return html`
      <div class="orden-list">
        <h2>Órdenes de Compra</h2>
        <table>
          <thead>
            <tr>
              <th>Orden ID</th>
              <th>ID de la Tienda</th>
              <th>Estado</th>
              <th>Observaciones</th>
              <th>Despacho ID</th>
             
              <th>Fecha Estimación Envío</th>
             
            </tr>
          </thead>
          <tbody>
            ${this.ordenes.map((orden) => {
              const despacho = this.despachos.find(
                (d) => d.orden_compra_id === orden.orden_id
              ); 
              return html`
                <tr>
                  <td>${orden.orden_id}</td>
                  <td>${orden.tienda_id}</td>
                  <td>${orden.estado}</td>
                  <td>${orden.observaciones || "(sin observaciones)"}</td>
                  <td>
                    ${despacho ? despacho.orden_despacho_id : "(sin despacho)"}
                  </td>
                 
                  <td>
                    ${despacho
                      ? despacho.fecha_estimacion_envio
                      : "(sin fecha)"}
                  </td>
                  
                  <td>
                    ${orden.estado === "ACEPTADA" && despacho
                      ? html`<button
                          @click="${() =>
                            this.ordenRecibida(
                              orden.orden_id,
                              despacho.orden_despacho_id
                            )}"
                        >
                          Marcar como Recibida
                        </button>`
                      : ""}
                  </td>
                </tr>
              `;
            })}
          </tbody>
        </table>

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
                    this.producto = e.target.value;
                    this.selectedProductoId = selectedProduct
                      ? selectedProduct.id
                      : ""; 
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
                </select>
                <button type="button" @click="${this.agregarItem}">
                  Agregar Ítem
                </button>
                <div class="item-list">
                  <h4>Ítems Agregados:</h4>
                  <ul>
                    ${this.items.map(
                      (item) => html`
                        <li>
                          ${item.producto} - Color: ${item.color}, Talle:
                          ${item.talle}, Cantidad: ${item.cantidad}
                        </li>
                      `
                    )}
                  </ul>
                </div>
              </div>

              <button type="submit">Enviar Orden de Compra</button>
            </form>
          `
        : ""}
    `;
  }
}

customElements.define("lit-orden-compra", LitOrdenCompra);
