import { supabase } from "@/services/supabase";
import * as FileSystem from "expo-file-system";

export async function uploadAvatar(
  uri: string,
  userId: string
): Promise<string> {
  try {
    // ファイル拡張子を取得
    const fileExtension = uri.split(".").pop()?.toLowerCase() || "jpg";
    const fileName = `${userId}-${Date.now()}.${fileExtension}`;
    console.log("Generated filename:", fileName);

    // ファイルをbase64で読み込み
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    console.log("File read successfully, size:", base64.length);

    // MIMEタイプを設定
    const mimeType = `image/${
      fileExtension === "jpg" ? "jpeg" : fileExtension
    }`;
    console.log("MIME type:", mimeType);

    // バイナリデータに変換
    const arrayBuffer = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
    console.log("Binary conversion successful, size:", arrayBuffer.length);

    // Supabase Storageにアップロード
    const { data, error } = await supabase.storage
      .from("avatars")
      .upload(fileName, arrayBuffer, {
        contentType: mimeType,
        upsert: false,
      });

    if (error) {
      console.error("Supabase Storage upload error:", error);
      throw new Error(`Storage upload failed: ${error.message}`);
    }

    console.log("Upload successful, path:", data.path);

    // 公開URLを取得
    const { data: publicUrlData } = supabase.storage
      .from("avatars")
      .getPublicUrl(data.path);

    const publicUrl = publicUrlData.publicUrl;

    return publicUrl;
  } catch (error: any) {
    console.error("Avatar upload failed:", error);

    // 具体的なエラーメッセージを提供
    if (error.message?.includes("Storage upload failed")) {
      throw error; // Supabaseエラーをそのまま投げる
    } else if (error.message?.includes("FileSystem")) {
      throw new Error("ファイルの読み込みに失敗しました");
    } else if (error.message?.includes("Network")) {
      throw new Error("ネットワークエラーが発生しました");
    } else {
      throw new Error(
        `画像のアップロードに失敗しました: ${error.message || "Unknown error"}`
      );
    }
  }
}

export async function deleteAvatar(avatarUrl: string): Promise<void> {
  try {
    // URLからファイルパスを抽出
    const url = new URL(avatarUrl);
    const pathParts = url.pathname.split("/");
    const fileName = pathParts[pathParts.length - 1];

    if (!fileName) {
      return; // ファイル名が取得できない場合はスキップ
    }

    // Supabase Storageから削除
    const { error } = await supabase.storage.from("avatars").remove([fileName]);

    if (error && error.message !== "The resource was not found") {
      console.error("Avatar deletion error:", error);
      // 削除エラーはログに記録するが、メイン処理は継続
    }
  } catch (error) {
    console.error("Avatar deletion error:", error);
    // 削除エラーはログに記録するが、メイン処理は継続
  }
}
