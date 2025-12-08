// app/api/proxy/[...path]/route.ts - Proxy genérico para API externa (contorna CORS)
// Esta rota faz proxy de requisições para a API externa, evitando problemas de CORS
import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return handleProxyRequest(request, path, 'GET');
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await params;
    console.log('[PROXY] POST called with path:', path);
    return handleProxyRequest(request, path, 'POST');
  } catch (error) {
    console.error('[PROXY] Error in POST handler:', error);
    return NextResponse.json(
      { error: 'Erro ao processar requisição', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return handleProxyRequest(request, path, 'PUT');
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return handleProxyRequest(request, path, 'DELETE');
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return handleProxyRequest(request, path, 'PATCH');
}

export async function OPTIONS() {
  // Preflight CORS
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

async function handleProxyRequest(
  request: NextRequest,
  pathSegments: string[],
  method: string
) {
  try {
    // Construir URL da API externa
    const path = pathSegments.join('/');
    const searchParams = request.nextUrl.searchParams.toString();
    
    // Se API_BASE_URL já termina com /api, não adiciona /api novamente
    // Remove /api do final se existir para evitar duplicação
    let baseUrl = API_BASE_URL;
    if (baseUrl.endsWith('/api')) {
      baseUrl = baseUrl.slice(0, -4); // Remove '/api'
    }
    
    // Garantir que baseUrl não termina com / e path não começa com /
    const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    
    const url = `${cleanBaseUrl}/${cleanPath}${searchParams ? `?${searchParams}` : ''}`;
    
    console.log('[PROXY]', method, url, { pathSegments, baseUrl: API_BASE_URL });

    // Obter headers da requisição original
    const headers: Record<string, string> = {};
    
    // Copiar headers importantes (especialmente Authorization)
    const authHeader = request.headers.get('authorization');
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }
    
    const contentType = request.headers.get('content-type');
    if (contentType) {
      headers['Content-Type'] = contentType;
    }

    // Obter body se existir
    let body: string | undefined;
    if (method !== 'GET' && method !== 'DELETE') {
      try {
        body = await request.text();
      } catch {
        // Sem body
      }
    }

    // Fazer requisição para a API externa
    const response = await fetch(url, {
      method,
      headers,
      body,
    });

    // Obter resposta
    const data = await response.text();
    let jsonData: any;
    try {
      jsonData = JSON.parse(data);
    } catch {
      jsonData = data;
    }

    // Retornar resposta com headers CORS
    return NextResponse.json(jsonData, {
      status: response.status,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  } catch (error: any) {
    console.error('[PROXY] Erro ao fazer proxy:', error);
    console.error('[PROXY] Stack:', error.stack);
    return NextResponse.json(
      { 
        error: 'Erro ao conectar com a API externa', 
        message: error.message,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      }
    );
  }
}

