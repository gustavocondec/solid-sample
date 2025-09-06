// SISTEMA DE BIBLIOTECA - EJEMPLOS PRINCIPIOS SOLID
// ================================================

// ========================================
// 1. SINGLE RESPONSIBILITY PRINCIPLE (SRP)
// ========================================
// Una clase debe tener una sola responsabilidad

class Libro {
  titulo: string;
  autor: string;
  isbn: string;
  disponible: boolean;

  constructor(titulo: string, autor: string, isbn: string) {
    this.titulo = titulo;
    this.autor = autor;
    this.isbn = isbn;
    this.disponible = true;
  }
}

class Usuario {
  nombre: string;
  id_usuario: string;

  constructor(nombre: string, id_usuario: string) {
    this.nombre = nombre;
    this.id_usuario = id_usuario;
  }
}

class Prestamo {
  libro: Libro;
  usuario: Usuario;
  fecha_prestamo: Date;
  fecha_devolucion: Date;
  devuelto: boolean;

  constructor(libro: Libro, usuario: Usuario) {
    this.libro = libro;
    this.usuario = usuario;
    this.fecha_prestamo = new Date();
    this.fecha_devolucion = new Date();
    this.fecha_devolucion.setDate(this.fecha_devolucion.getDate() + 14);
    this.devuelto = false;
  }
}

// ========================================
// 2. OPEN/CLOSED PRINCIPLE (OCP)
// ========================================
// Abierto para extensión, cerrado para modificación

abstract class CalculadoraMulta {
  abstract calcular(dias_retraso: number): number;
}

class MultaEstandar extends CalculadoraMulta {
  calcular(dias_retraso: number): number {
    return dias_retraso * 10;
  }
}

class MultaEstudiante extends CalculadoraMulta {
  calcular(dias_retraso: number): number {
    return dias_retraso * 5;
  }
}

class MultaVIP extends CalculadoraMulta {
  calcular(dias_retraso: number): number {
    return 0;
  }
}

// ========================================
// 3. LISKOV SUBSTITUTION PRINCIPLE (LSP)
// ========================================
// Los objetos derivados deben poder sustituir a la clase base

abstract class Notificador {
  abstract enviar(mensaje: string, destinatario: string): boolean;
}

class NotificadorEmail extends Notificador {
  enviar(mensaje: string, destinatario: string): boolean {
    console.log(`📧 Email a ${destinatario}: ${mensaje}`);
    return true;
  }
}

class NotificadorSMS extends Notificador {
  enviar(mensaje: string, destinatario: string): boolean {
    console.log(`📱 SMS a ${destinatario}: ${mensaje}`);
    return true;
  }
}

// ========================================
// 4. INTERFACE SEGREGATION PRINCIPLE (ISP)
// ========================================
// Los clientes no deben depender de interfaces que no usan

interface Reservable {
  reservar(usuario: Usuario): void;
}

interface Prestable {
  prestar(usuario: Usuario): void;
}

interface Renovable {
  renovar(prestamo: Prestamo): void;
}

// ========================================
// 5. DEPENDENCY INVERSION PRINCIPLE (DIP)
// ========================================
// Depender de abstracciones, no de implementaciones concretas

class GestorPrestamos {
  private calculadora_multa: CalculadoraMulta;
  private notificador: Notificador;
  private prestamos: Prestamo[];

  constructor(calculadora_multa: CalculadoraMulta, notificador: Notificador) {
    this.calculadora_multa = calculadora_multa;
    this.notificador = notificador;
    this.prestamos = [];
  }

  realizar_prestamo(libro: Libro, usuario: Usuario): Prestamo | null {
    if (!libro.disponible) {
      console.log(`❌ El libro '${libro.titulo}' no está disponible`);
      return null;
    }

    libro.disponible = false;
    const prestamo = new Prestamo(libro, usuario);
    this.prestamos.push(prestamo);

    const mensaje = `Has prestado '${libro.titulo}'. Fecha de devolución: ${
      prestamo.fecha_devolucion.toISOString().split("T")[0]
    }`;
    this.notificador.enviar(mensaje, usuario.nombre);

    console.log(
      `✅ Préstamo realizado: '${libro.titulo}' para ${usuario.nombre}`
    );
    return prestamo;
  }

  devolver_libro(prestamo: Prestamo): void {
    if (prestamo.devuelto) {
      console.log("❌ Este libro ya fue devuelto");
      return;
    }

    const fecha_actual = new Date();
    if (fecha_actual > prestamo.fecha_devolucion) {
      const dias_retraso = Math.floor(
        (fecha_actual.getTime() - prestamo.fecha_devolucion.getTime()) /
          (1000 * 60 * 60 * 24)
      );
      const multa = this.calculadora_multa.calcular(dias_retraso);
      console.log(`⚠️  Retraso de ${dias_retraso} días. Multa: $${multa}`);
    } else {
      console.log("✅ Libro devuelto a tiempo");
    }

    prestamo.devuelto = true;
    prestamo.libro.disponible = true;
    console.log(
      `📚 '${prestamo.libro.titulo}' devuelto por ${prestamo.usuario.nombre}`
    );
  }
}

// ========================================
// EJEMPLO DE USO
// ========================================

function main(): void {
  console.log("🏛️  SISTEMA DE BIBLIOTECA - PRINCIPIOS SOLID");
  console.log("=".repeat(50));

  // Crear libros
  const libro1 = new Libro("1984", "George Orwell", "978-0-452-28423-4");
  const libro2 = new Libro(
    "Cien años de soledad",
    "Gabriel García Márquez",
    "978-84-376-0494-7"
  );

  // Crear usuarios
  const usuario1 = new Usuario("Ana García", "U001");
  const usuario2 = new Usuario("Carlos López", "U002");

  // Crear diferentes gestores con distintas configuraciones
  console.log("\n📋 GESTOR PARA USUARIOS REGULARES:");
  const gestor_regular = new GestorPrestamos(
    new MultaEstandar(),
    new NotificadorEmail()
  );

  console.log("\n📋 GESTOR PARA ESTUDIANTES:");
  const gestor_estudiante = new GestorPrestamos(
    new MultaEstudiante(),
    new NotificadorSMS()
  );

  // Realizar préstamos
  console.log("\n🔄 REALIZANDO PRÉSTAMOS:");
  const prestamo1 = gestor_regular.realizar_prestamo(libro1, usuario1);
  const prestamo2 = gestor_estudiante.realizar_prestamo(libro2, usuario2);

  // Simular devolución tardía
  console.log("\n📅 SIMULANDO DEVOLUCIÓN TARDÍA:");
  if (prestamo1) {
    prestamo1.fecha_devolucion = new Date(
      new Date().getTime() - 3 * 24 * 60 * 60 * 1000
    ); // 3 días antes
    gestor_regular.devolver_libro(prestamo1);
  }

  // Devolución a tiempo
  console.log("\n📅 DEVOLUCIÓN A TIEMPO:");
  if (prestamo2) {
    gestor_estudiante.devolver_libro(prestamo2);
  }
}

main();
